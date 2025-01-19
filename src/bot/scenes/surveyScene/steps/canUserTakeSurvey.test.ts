import { canTakeSurvey } from "./canUserTakeSurvey";
import { AuthUserKeyboard } from "../../../keyboards/AuthUserKeyboard";
import { MyContext } from "../../../types/type";
import { User } from "../../../../database/queries/userQueries";
import { SURVEY_SCENE } from "../../../constants/scenes";
import { formatTimestamp } from "../../../../lib/date";

describe("Test canTakeSurvey", () => {
  let ctx: Partial<MyContext>;

  const nowDateTime = new Date();

  const tenDaysForward = new Date(nowDateTime);
  const oneDaysAgo = new Date(nowDateTime);

  tenDaysForward.setDate(nowDateTime.getDate() + 10);
  oneDaysAgo.setDate(nowDateTime.getDate() - 1);

  beforeEach(() => {
    ctx = {
      from: {
        id: 12345,
        is_bot: false,
        first_name: "User_test",
      },
      reply: jest.fn(),
      conversation: {
        enter: jest.fn(),
      } as unknown as MyContext["conversation"],
    };
  });

  // Должно возвращать false если status busy
  it("Should false if status busy", async () => {
    let user: Partial<User> = {
      status: "busy",
      survey_lock_until: null,
    };
    const result = await canTakeSurvey(
      ctx as MyContext,
      nowDateTime,
      user as User,
    );
    expect(result).toBe(false);
    expect(ctx.reply).toBeCalledWith(SURVEY_SCENE.USER_BUSY, {
      reply_markup: AuthUserKeyboard(),
    });
  });

  // Должно возвращать false если survey_lock_until еще не прошел
  it("Should false if survey_lock_until > now", async () => {
    let user: Partial<User> = {
      status: "free",
      survey_lock_until: tenDaysForward.toISOString(),
    };
    const result = await canTakeSurvey(
      ctx as MyContext,
      nowDateTime,
      user as User,
    );
    expect(result).toBe(false);
    expect(ctx.reply).toBeCalledWith(
      `${SURVEY_SCENE.USER_CANT_SURVEY} ${formatTimestamp(Number(new Date(tenDaysForward.toISOString())))}`,
      {
        reply_markup: AuthUserKeyboard(),
      },
    );
  });

  // Должно возвращать true если survey_lock_until прошел и статус не busy
  it("Should false if survey_lock_until < now and status not busy", async () => {
    let user: Partial<User> = {
      status: "free",
      survey_lock_until: oneDaysAgo.toISOString(),
    };
    const result = await canTakeSurvey(
      ctx as MyContext,
      nowDateTime,
      user as User,
    );
    expect(result).toBe(true);
  });
});
