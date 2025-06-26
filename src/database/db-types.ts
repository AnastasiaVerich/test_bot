import { Generated } from "kysely";
import {
  AdvertisingCampaignsEntity,
  AuditorEntity,
  AuditorSurveyActiveEntity,
  AuditorSurveyTaskCompletionsEntity,
  BlacklistUsersEntity,
  BotUserLogsEntity,
  CommonVariablesEntity,
  FaceEmbeddingsEntity,
  OperatorsEntity,
  PendingPaymentsEntity,
  PhotosEntity,
  RecheckSurveyEntity,
  ReferralBonusesEntity,
  RegionSettingsEntity,
  SupervisorEntity,
  SurveyActiveEntity,
  SurveyCompletionsEntity,
  SurveysEntity,
  SurveyTasksEntity,
  UsersEntity,
  VideosEntity,
  WithdrawalLogsEntity,
} from "./db-interface";

type UnwrapGenerated<T> = T extends Generated<infer U> ? U : T;

type UnwrapGeneratedEntity<T> = {
  [K in keyof T]: UnwrapGenerated<T[K]>;
};

export type BlacklistUsersType = UnwrapGeneratedEntity<BlacklistUsersEntity>;
export type CommonVariablesType = UnwrapGeneratedEntity<CommonVariablesEntity>;
export type FaceEmbeddingsType = UnwrapGeneratedEntity<FaceEmbeddingsEntity>;
export type OperatorsType = UnwrapGeneratedEntity<OperatorsEntity>;
export type SupervisorType = UnwrapGeneratedEntity<SupervisorEntity>;
export type AdvertisingCampaignsType =
  UnwrapGeneratedEntity<AdvertisingCampaignsEntity>;
export type BotUserLogsType = UnwrapGeneratedEntity<BotUserLogsEntity>;
export type PendingPaymentsType = UnwrapGeneratedEntity<PendingPaymentsEntity>;
export type PhotosType = UnwrapGeneratedEntity<PhotosEntity>;
export type RegionSettingsType = UnwrapGeneratedEntity<RegionSettingsEntity>;
export type WithdrawalLogsType = UnwrapGeneratedEntity<WithdrawalLogsEntity>;
export type ReferralBonusesType = UnwrapGeneratedEntity<ReferralBonusesEntity>;
export type UsersType = UnwrapGeneratedEntity<UsersEntity>;
export type SurveysType = UnwrapGeneratedEntity<SurveysEntity>;
export type SurveyActiveType = UnwrapGeneratedEntity<SurveyActiveEntity>;
export type RecheckSurveyType = UnwrapGeneratedEntity<RecheckSurveyEntity>;
export type SurveyCompletionsType =
  UnwrapGeneratedEntity<SurveyCompletionsEntity>;
export type SurveyTasksType = UnwrapGeneratedEntity<SurveyTasksEntity>;
export type VideosType = UnwrapGeneratedEntity<VideosEntity>;
export type AuditorsType = UnwrapGeneratedEntity<AuditorEntity>;
export type AuditorSurveyActiveType =
  UnwrapGeneratedEntity<AuditorSurveyActiveEntity>;
export type AuditorSurveyTaskCompletionsType =
  UnwrapGeneratedEntity<AuditorSurveyTaskCompletionsEntity>;
