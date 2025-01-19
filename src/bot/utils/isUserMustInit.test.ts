import { MyContext } from "../types/type";
import { User } from "../../database/queries/userQueries";
import { isUserMustInit } from "./isUserMustInit";
import { Scenes } from "../scenes";

jest.mock("../../database/queries/userQueries");

describe("Test isUserMustInit", () => {
  let ctx: Partial<MyContext>;

  const nowDateTime = new Date();

  const tenDaysAgo = new Date(nowDateTime);
  const oneDaysAgo = new Date(nowDateTime);

  tenDaysAgo.setDate(nowDateTime.getDate() - 10);
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

  // Проверяем, если последняя инициализация была давно,
  // то возвращать надо true и перекидывать на инициализацию
  it("Should false if last init was more than 7 days.", async () => {
    let user: Partial<User> = {
      last_init: tenDaysAgo.toISOString(),
    };
    const result = await isUserMustInit(ctx as MyContext, user as User);
    expect(result).toBe(true);
    expect(ctx.conversation?.enter).toBeCalledWith(Scenes.IdentificationScene);
  });

  // Проверяем, если последняя инициализация была давно, то возвращать надо false
  it("Should true if last init was less than 7 days.", async () => {
    let user: Partial<User> = {
      last_init: oneDaysAgo.toISOString(),
    };
    const result = await isUserMustInit(ctx as MyContext, user as User);
    expect(result).toBe(false);
  });
});
