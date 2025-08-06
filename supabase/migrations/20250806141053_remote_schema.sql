create sequence "public"."achievements_id_seq";

create sequence "public"."daily_scripture_selections_id_seq";

create sequence "public"."groups_id_seq";

create sequence "public"."prayer_comments_id_seq";

create sequence "public"."prayer_requests_id_seq";

create sequence "public"."scriptures_id_seq";

create sequence "public"."social_shares_id_seq";

create sequence "public"."yearly_reading_plan_id_seq";

drop trigger if exists "update_care_groups_updated_at" on "public"."care_groups";

drop trigger if exists "trigger_event_notification" on "public"."events";

drop trigger if exists "update_events_updated_at" on "public"."events";

drop trigger if exists "update_notifications_updated_at" on "public"."notifications";

drop trigger if exists "update_prayer_comments_updated_at" on "public"."prayer_comments";

drop trigger if exists "trigger_prayer_like_notification" on "public"."prayer_likes";

drop trigger if exists "trigger_prayer_comment_notification" on "public"."prayer_responses";

drop trigger if exists "update_prayers_updated_at" on "public"."prayers";

drop policy "Admins can manage bible verses" on "public"."bible_verses";

drop policy "Everyone can view bible verses" on "public"."bible_verses";

drop policy "Anyone can view care groups" on "public"."care_groups";

drop policy "Authenticated users can create groups" on "public"."care_groups";

drop policy "Group leaders can update their groups" on "public"."care_groups";

drop policy "Authenticated users can create events" on "public"."events";

drop policy "Event organizers can delete their events" on "public"."events";

drop policy "Event organizers can update their events" on "public"."events";

drop policy "Users can view public events or group events they're in" on "public"."events";

drop policy "Group leaders can manage members" on "public"."group_members";

drop policy "Users can join groups" on "public"."group_members";

drop policy "Users can leave groups" on "public"."group_members";

drop policy "Users can view group memberships" on "public"."group_members";

drop policy "System can insert notifications" on "public"."notifications";

drop policy "Users can update their own notifications" on "public"."notifications";

drop policy "Users can view their own notifications" on "public"."notifications";

drop policy "Users can create comments" on "public"."prayer_comments";

drop policy "Users can delete their own comments" on "public"."prayer_comments";

drop policy "Users can update their own comments" on "public"."prayer_comments";

drop policy "Users can view comments on visible prayers" on "public"."prayer_comments";

drop policy "Users can manage their own likes" on "public"."prayer_likes";

drop policy "Users can view all likes" on "public"."prayer_likes";

drop policy "Users can create prayer responses" on "public"."prayer_responses";

drop policy "Users can delete their own responses" on "public"."prayer_responses";

drop policy "Users can update their own responses" on "public"."prayer_responses";

drop policy "Users can view prayer responses for visible prayers" on "public"."prayer_responses";

drop policy "Users can create prayers" on "public"."prayers";

drop policy "Users can delete their own prayers" on "public"."prayers";

drop policy "Users can update their own prayers" on "public"."prayers";

drop policy "Users can view non-private prayers" on "public"."prayers";

drop policy "Users can insert their own profile" on "public"."profiles";

drop policy "Users can update their own profile" on "public"."profiles";

drop policy "Users can view all profiles" on "public"."profiles";

drop policy "System can create achievements" on "public"."user_achievements";

drop policy "Users can view their own achievements" on "public"."user_achievements";

drop policy "Users can manage their own bible progress" on "public"."user_bible_progress";

drop policy "Admins can manage all roles" on "public"."user_roles";

drop policy "Users can view all role assignments" on "public"."user_roles";

revoke delete on table "public"."bible_verses" from "anon";

revoke insert on table "public"."bible_verses" from "anon";

revoke references on table "public"."bible_verses" from "anon";

revoke select on table "public"."bible_verses" from "anon";

revoke trigger on table "public"."bible_verses" from "anon";

revoke truncate on table "public"."bible_verses" from "anon";

revoke update on table "public"."bible_verses" from "anon";

revoke delete on table "public"."bible_verses" from "authenticated";

revoke insert on table "public"."bible_verses" from "authenticated";

revoke references on table "public"."bible_verses" from "authenticated";

revoke select on table "public"."bible_verses" from "authenticated";

revoke trigger on table "public"."bible_verses" from "authenticated";

revoke truncate on table "public"."bible_verses" from "authenticated";

revoke update on table "public"."bible_verses" from "authenticated";

revoke delete on table "public"."bible_verses" from "service_role";

revoke insert on table "public"."bible_verses" from "service_role";

revoke references on table "public"."bible_verses" from "service_role";

revoke select on table "public"."bible_verses" from "service_role";

revoke trigger on table "public"."bible_verses" from "service_role";

revoke truncate on table "public"."bible_verses" from "service_role";

revoke update on table "public"."bible_verses" from "service_role";

revoke delete on table "public"."care_groups" from "anon";

revoke insert on table "public"."care_groups" from "anon";

revoke references on table "public"."care_groups" from "anon";

revoke select on table "public"."care_groups" from "anon";

revoke trigger on table "public"."care_groups" from "anon";

revoke truncate on table "public"."care_groups" from "anon";

revoke update on table "public"."care_groups" from "anon";

revoke delete on table "public"."care_groups" from "authenticated";

revoke insert on table "public"."care_groups" from "authenticated";

revoke references on table "public"."care_groups" from "authenticated";

revoke select on table "public"."care_groups" from "authenticated";

revoke trigger on table "public"."care_groups" from "authenticated";

revoke truncate on table "public"."care_groups" from "authenticated";

revoke update on table "public"."care_groups" from "authenticated";

revoke delete on table "public"."care_groups" from "service_role";

revoke insert on table "public"."care_groups" from "service_role";

revoke references on table "public"."care_groups" from "service_role";

revoke select on table "public"."care_groups" from "service_role";

revoke trigger on table "public"."care_groups" from "service_role";

revoke truncate on table "public"."care_groups" from "service_role";

revoke update on table "public"."care_groups" from "service_role";

revoke delete on table "public"."events" from "anon";

revoke insert on table "public"."events" from "anon";

revoke references on table "public"."events" from "anon";

revoke select on table "public"."events" from "anon";

revoke trigger on table "public"."events" from "anon";

revoke truncate on table "public"."events" from "anon";

revoke update on table "public"."events" from "anon";

revoke delete on table "public"."events" from "authenticated";

revoke insert on table "public"."events" from "authenticated";

revoke references on table "public"."events" from "authenticated";

revoke select on table "public"."events" from "authenticated";

revoke trigger on table "public"."events" from "authenticated";

revoke truncate on table "public"."events" from "authenticated";

revoke update on table "public"."events" from "authenticated";

revoke delete on table "public"."events" from "service_role";

revoke insert on table "public"."events" from "service_role";

revoke references on table "public"."events" from "service_role";

revoke select on table "public"."events" from "service_role";

revoke trigger on table "public"."events" from "service_role";

revoke truncate on table "public"."events" from "service_role";

revoke update on table "public"."events" from "service_role";

revoke delete on table "public"."group_members" from "anon";

revoke insert on table "public"."group_members" from "anon";

revoke references on table "public"."group_members" from "anon";

revoke select on table "public"."group_members" from "anon";

revoke trigger on table "public"."group_members" from "anon";

revoke truncate on table "public"."group_members" from "anon";

revoke update on table "public"."group_members" from "anon";

revoke delete on table "public"."group_members" from "authenticated";

revoke insert on table "public"."group_members" from "authenticated";

revoke references on table "public"."group_members" from "authenticated";

revoke select on table "public"."group_members" from "authenticated";

revoke trigger on table "public"."group_members" from "authenticated";

revoke truncate on table "public"."group_members" from "authenticated";

revoke update on table "public"."group_members" from "authenticated";

revoke delete on table "public"."group_members" from "service_role";

revoke insert on table "public"."group_members" from "service_role";

revoke references on table "public"."group_members" from "service_role";

revoke select on table "public"."group_members" from "service_role";

revoke trigger on table "public"."group_members" from "service_role";

revoke truncate on table "public"."group_members" from "service_role";

revoke update on table "public"."group_members" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."notifications" from "service_role";

revoke insert on table "public"."notifications" from "service_role";

revoke references on table "public"."notifications" from "service_role";

revoke select on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

revoke update on table "public"."notifications" from "service_role";

revoke delete on table "public"."prayer_responses" from "anon";

revoke insert on table "public"."prayer_responses" from "anon";

revoke references on table "public"."prayer_responses" from "anon";

revoke select on table "public"."prayer_responses" from "anon";

revoke trigger on table "public"."prayer_responses" from "anon";

revoke truncate on table "public"."prayer_responses" from "anon";

revoke update on table "public"."prayer_responses" from "anon";

revoke delete on table "public"."prayer_responses" from "authenticated";

revoke insert on table "public"."prayer_responses" from "authenticated";

revoke references on table "public"."prayer_responses" from "authenticated";

revoke select on table "public"."prayer_responses" from "authenticated";

revoke trigger on table "public"."prayer_responses" from "authenticated";

revoke truncate on table "public"."prayer_responses" from "authenticated";

revoke update on table "public"."prayer_responses" from "authenticated";

revoke delete on table "public"."prayer_responses" from "service_role";

revoke insert on table "public"."prayer_responses" from "service_role";

revoke references on table "public"."prayer_responses" from "service_role";

revoke select on table "public"."prayer_responses" from "service_role";

revoke trigger on table "public"."prayer_responses" from "service_role";

revoke truncate on table "public"."prayer_responses" from "service_role";

revoke update on table "public"."prayer_responses" from "service_role";

revoke delete on table "public"."prayers" from "anon";

revoke insert on table "public"."prayers" from "anon";

revoke references on table "public"."prayers" from "anon";

revoke select on table "public"."prayers" from "anon";

revoke trigger on table "public"."prayers" from "anon";

revoke truncate on table "public"."prayers" from "anon";

revoke update on table "public"."prayers" from "anon";

revoke delete on table "public"."prayers" from "authenticated";

revoke insert on table "public"."prayers" from "authenticated";

revoke references on table "public"."prayers" from "authenticated";

revoke select on table "public"."prayers" from "authenticated";

revoke trigger on table "public"."prayers" from "authenticated";

revoke truncate on table "public"."prayers" from "authenticated";

revoke update on table "public"."prayers" from "authenticated";

revoke delete on table "public"."prayers" from "service_role";

revoke insert on table "public"."prayers" from "service_role";

revoke references on table "public"."prayers" from "service_role";

revoke select on table "public"."prayers" from "service_role";

revoke trigger on table "public"."prayers" from "service_role";

revoke truncate on table "public"."prayers" from "service_role";

revoke update on table "public"."prayers" from "service_role";

revoke delete on table "public"."user_bible_progress" from "anon";

revoke insert on table "public"."user_bible_progress" from "anon";

revoke references on table "public"."user_bible_progress" from "anon";

revoke select on table "public"."user_bible_progress" from "anon";

revoke trigger on table "public"."user_bible_progress" from "anon";

revoke truncate on table "public"."user_bible_progress" from "anon";

revoke update on table "public"."user_bible_progress" from "anon";

revoke delete on table "public"."user_bible_progress" from "authenticated";

revoke insert on table "public"."user_bible_progress" from "authenticated";

revoke references on table "public"."user_bible_progress" from "authenticated";

revoke select on table "public"."user_bible_progress" from "authenticated";

revoke trigger on table "public"."user_bible_progress" from "authenticated";

revoke truncate on table "public"."user_bible_progress" from "authenticated";

revoke update on table "public"."user_bible_progress" from "authenticated";

revoke delete on table "public"."user_bible_progress" from "service_role";

revoke insert on table "public"."user_bible_progress" from "service_role";

revoke references on table "public"."user_bible_progress" from "service_role";

revoke select on table "public"."user_bible_progress" from "service_role";

revoke trigger on table "public"."user_bible_progress" from "service_role";

revoke truncate on table "public"."user_bible_progress" from "service_role";

revoke update on table "public"."user_bible_progress" from "service_role";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_roles" from "authenticated";

revoke insert on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_roles" from "authenticated";

revoke select on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke update on table "public"."user_roles" from "authenticated";

revoke delete on table "public"."user_roles" from "service_role";

revoke insert on table "public"."user_roles" from "service_role";

revoke references on table "public"."user_roles" from "service_role";

revoke select on table "public"."user_roles" from "service_role";

revoke trigger on table "public"."user_roles" from "service_role";

revoke truncate on table "public"."user_roles" from "service_role";

revoke update on table "public"."user_roles" from "service_role";

alter table "public"."care_groups" drop constraint "care_groups_leader_id_fkey";

alter table "public"."events" drop constraint "events_care_group_id_fkey";

alter table "public"."events" drop constraint "events_event_type_check";

alter table "public"."events" drop constraint "events_organizer_id_fkey";

alter table "public"."group_members" drop constraint "group_members_group_id_fkey";

alter table "public"."group_members" drop constraint "group_members_group_id_user_id_key";

alter table "public"."group_members" drop constraint "group_members_role_check";

alter table "public"."group_members" drop constraint "group_members_user_id_fkey";

alter table "public"."notifications" drop constraint "notifications_type_check";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."prayer_likes" drop constraint "prayer_likes_prayer_id_user_id_key";

alter table "public"."prayer_responses" drop constraint "prayer_responses_prayer_id_fkey";

alter table "public"."prayer_responses" drop constraint "prayer_responses_response_type_check";

alter table "public"."prayer_responses" drop constraint "prayer_responses_user_id_fkey";

alter table "public"."prayers" drop constraint "prayers_care_group_id_fkey";

alter table "public"."prayers" drop constraint "prayers_status_check";

alter table "public"."prayers" drop constraint "prayers_user_id_fkey";

alter table "public"."user_bible_progress" drop constraint "user_bible_progress_user_id_fkey";

alter table "public"."user_bible_progress" drop constraint "user_bible_progress_user_id_reading_day_key";

alter table "public"."user_roles" drop constraint "user_roles_assigned_by_fkey";

alter table "public"."user_roles" drop constraint "user_roles_user_id_fkey";

alter table "public"."user_roles" drop constraint "user_roles_user_id_role_key";

alter table "public"."prayer_comments" drop constraint "prayer_comments_prayer_id_fkey";

alter table "public"."prayer_comments" drop constraint "prayer_comments_user_id_fkey";

alter table "public"."prayer_likes" drop constraint "prayer_likes_prayer_id_fkey";

alter table "public"."prayer_likes" drop constraint "prayer_likes_user_id_fkey";

alter table "public"."user_achievements" drop constraint "user_achievements_user_id_fkey";

drop function if exists "public"."create_event_notification"();

drop function if exists "public"."create_prayer_comment_notification"();

drop function if exists "public"."create_prayer_like_notification"();

drop function if exists "public"."has_role"(_user_id uuid, _role app_role);

drop function if exists "public"."update_notifications_updated_at"();

alter table "public"."bible_verses" drop constraint "bible_verses_pkey";

alter table "public"."care_groups" drop constraint "care_groups_pkey";

alter table "public"."events" drop constraint "events_pkey";

alter table "public"."group_members" drop constraint "group_members_pkey";

alter table "public"."notifications" drop constraint "notifications_pkey";

alter table "public"."prayer_responses" drop constraint "prayer_responses_pkey";

alter table "public"."prayers" drop constraint "prayers_pkey";

alter table "public"."user_bible_progress" drop constraint "user_bible_progress_pkey";

alter table "public"."user_roles" drop constraint "user_roles_pkey";

alter table "public"."prayer_likes" drop constraint "prayer_likes_pkey";

alter table "public"."user_achievements" drop constraint "user_achievements_pkey";

drop index if exists "public"."bible_verses_pkey";

drop index if exists "public"."care_groups_pkey";

drop index if exists "public"."events_pkey";

drop index if exists "public"."group_members_group_id_user_id_key";

drop index if exists "public"."group_members_pkey";

drop index if exists "public"."idx_notifications_created_at";

drop index if exists "public"."idx_notifications_is_read";

drop index if exists "public"."idx_notifications_user_id";

drop index if exists "public"."notifications_pkey";

drop index if exists "public"."prayer_likes_prayer_id_user_id_key";

drop index if exists "public"."prayer_responses_pkey";

drop index if exists "public"."prayers_pkey";

drop index if exists "public"."user_bible_progress_pkey";

drop index if exists "public"."user_bible_progress_user_id_reading_day_key";

drop index if exists "public"."user_roles_pkey";

drop index if exists "public"."user_roles_user_id_role_key";

drop index if exists "public"."prayer_likes_pkey";

drop index if exists "public"."user_achievements_pkey";

drop table "public"."bible_verses";

drop table "public"."care_groups";

drop table "public"."events";

drop table "public"."group_members";

drop table "public"."notifications";

drop table "public"."prayer_responses";

drop table "public"."prayers";

drop table "public"."user_bible_progress";

drop table "public"."user_roles";

create table "public"."achievements" (
    "id" integer not null default nextval('achievements_id_seq'::regclass),
    "name" text not null,
    "description" text,
    "image_url" text,
    "requirement_type" text,
    "requirement_value" integer,
    "points" integer default 0
);


alter table "public"."achievements" enable row level security;

create table "public"."daily_readings" (
    "id" uuid not null default gen_random_uuid(),
    "date" date not null,
    "readings" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."daily_readings" enable row level security;

create table "public"."daily_scripture_selections" (
    "id" integer not null default nextval('daily_scripture_selections_id_seq'::regclass),
    "user_id" uuid,
    "date" date not null default CURRENT_DATE,
    "selected_verse_id" integer,
    "alternatives" jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."daily_scripture_selections" enable row level security;

create table "public"."groups" (
    "id" integer not null default nextval('groups_id_seq'::regclass),
    "name" text not null,
    "description" text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."groups" enable row level security;

create table "public"."prayer_requests" (
    "id" integer not null default nextval('prayer_requests_id_seq'::regclass),
    "user_id" uuid,
    "title" text not null,
    "content" text not null,
    "is_public" boolean default true,
    "likes_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."prayer_requests" enable row level security;

create table "public"."reading_progress" (
    "user_id" uuid not null,
    "scripture_id" integer not null,
    "read_at" timestamp with time zone default now(),
    "completed" boolean default false
);


alter table "public"."reading_progress" enable row level security;

create table "public"."scriptures" (
    "id" integer not null default nextval('scriptures_id_seq'::regclass),
    "book" text not null,
    "chapter" integer not null,
    "verse" integer not null,
    "content" text not null,
    "explanation" text,
    "translation" text default 'Thai'::text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."scriptures" enable row level security;

create table "public"."social_shares" (
    "id" integer not null default nextval('social_shares_id_seq'::regclass),
    "user_id" uuid,
    "content_type" text,
    "content_id" integer,
    "platform" text,
    "shared_at" timestamp with time zone default now()
);


alter table "public"."social_shares" enable row level security;

create table "public"."user_groups" (
    "user_id" uuid not null,
    "group_id" integer not null,
    "joined_at" timestamp with time zone default now()
);


alter table "public"."user_groups" enable row level security;

create table "public"."yearly_reading_plan" (
    "id" integer not null default nextval('yearly_reading_plan_id_seq'::regclass),
    "user_id" uuid,
    "year" integer not null,
    "total_chapters" integer default 1189,
    "chapters_read" integer default 0,
    "start_date" date default CURRENT_DATE,
    "target_completion_date" date,
    "created_at" timestamp with time zone default now()
);


alter table "public"."yearly_reading_plan" enable row level security;

alter table "public"."prayer_comments" drop column "updated_at";

alter table "public"."prayer_comments" alter column "created_at" drop not null;

alter table "public"."prayer_comments" alter column "id" set default nextval('prayer_comments_id_seq'::regclass);

alter table "public"."prayer_comments" alter column "id" set data type integer using "id"::integer;

alter table "public"."prayer_comments" alter column "prayer_id" drop not null;

alter table "public"."prayer_comments" alter column "prayer_id" set data type integer using "prayer_id"::integer;

alter table "public"."prayer_comments" alter column "user_id" drop not null;

alter table "public"."prayer_likes" drop column "id";

alter table "public"."prayer_likes" alter column "created_at" drop not null;

alter table "public"."prayer_likes" alter column "prayer_id" set data type integer using "prayer_id"::integer;

alter table "public"."profiles" drop column "display_name";

alter table "public"."profiles" drop column "first_name";

alter table "public"."profiles" drop column "last_name";

alter table "public"."profiles" drop column "location";

alter table "public"."profiles" drop column "phone";

alter table "public"."profiles" add column "email" text;

alter table "public"."profiles" add column "name" text;

alter table "public"."profiles" add column "role" text default 'user'::text;

alter table "public"."profiles" alter column "created_at" drop not null;

alter table "public"."profiles" alter column "updated_at" drop not null;

alter table "public"."user_achievements" drop column "achievement_data";

alter table "public"."user_achievements" drop column "achievement_type";

alter table "public"."user_achievements" drop column "id";

alter table "public"."user_achievements" add column "achievement_id" integer not null;

alter table "public"."user_achievements" add column "shared_to_social" boolean default false;

alter table "public"."user_achievements" alter column "earned_at" drop not null;

alter sequence "public"."achievements_id_seq" owned by "public"."achievements"."id";

alter sequence "public"."daily_scripture_selections_id_seq" owned by "public"."daily_scripture_selections"."id";

alter sequence "public"."groups_id_seq" owned by "public"."groups"."id";

alter sequence "public"."prayer_comments_id_seq" owned by "public"."prayer_comments"."id";

alter sequence "public"."prayer_requests_id_seq" owned by "public"."prayer_requests"."id";

alter sequence "public"."scriptures_id_seq" owned by "public"."scriptures"."id";

alter sequence "public"."social_shares_id_seq" owned by "public"."social_shares"."id";

alter sequence "public"."yearly_reading_plan_id_seq" owned by "public"."yearly_reading_plan"."id";

drop type "public"."app_role";

CREATE UNIQUE INDEX achievements_pkey ON public.achievements USING btree (id);

CREATE UNIQUE INDEX daily_readings_date_key ON public.daily_readings USING btree (date);

CREATE UNIQUE INDEX daily_readings_pkey ON public.daily_readings USING btree (id);

CREATE UNIQUE INDEX daily_scripture_selections_pkey ON public.daily_scripture_selections USING btree (id);

CREATE UNIQUE INDEX daily_scripture_selections_user_id_date_key ON public.daily_scripture_selections USING btree (user_id, date);

CREATE UNIQUE INDEX groups_name_key ON public.groups USING btree (name);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

CREATE INDEX idx_daily_readings_date ON public.daily_readings USING btree (date);

CREATE UNIQUE INDEX prayer_requests_pkey ON public.prayer_requests USING btree (id);

CREATE UNIQUE INDEX reading_progress_pkey ON public.reading_progress USING btree (user_id, scripture_id);

CREATE UNIQUE INDEX scriptures_book_chapter_verse_key ON public.scriptures USING btree (book, chapter, verse);

CREATE UNIQUE INDEX scriptures_pkey ON public.scriptures USING btree (id);

CREATE UNIQUE INDEX social_shares_pkey ON public.social_shares USING btree (id);

CREATE UNIQUE INDEX user_groups_pkey ON public.user_groups USING btree (user_id, group_id);

CREATE UNIQUE INDEX yearly_reading_plan_pkey ON public.yearly_reading_plan USING btree (id);

CREATE UNIQUE INDEX yearly_reading_plan_user_id_year_key ON public.yearly_reading_plan USING btree (user_id, year);

CREATE UNIQUE INDEX prayer_likes_pkey ON public.prayer_likes USING btree (prayer_id, user_id);

CREATE UNIQUE INDEX user_achievements_pkey ON public.user_achievements USING btree (user_id, achievement_id);

alter table "public"."achievements" add constraint "achievements_pkey" PRIMARY KEY using index "achievements_pkey";

alter table "public"."daily_readings" add constraint "daily_readings_pkey" PRIMARY KEY using index "daily_readings_pkey";

alter table "public"."daily_scripture_selections" add constraint "daily_scripture_selections_pkey" PRIMARY KEY using index "daily_scripture_selections_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."prayer_requests" add constraint "prayer_requests_pkey" PRIMARY KEY using index "prayer_requests_pkey";

alter table "public"."reading_progress" add constraint "reading_progress_pkey" PRIMARY KEY using index "reading_progress_pkey";

alter table "public"."scriptures" add constraint "scriptures_pkey" PRIMARY KEY using index "scriptures_pkey";

alter table "public"."social_shares" add constraint "social_shares_pkey" PRIMARY KEY using index "social_shares_pkey";

alter table "public"."user_groups" add constraint "user_groups_pkey" PRIMARY KEY using index "user_groups_pkey";

alter table "public"."yearly_reading_plan" add constraint "yearly_reading_plan_pkey" PRIMARY KEY using index "yearly_reading_plan_pkey";

alter table "public"."prayer_likes" add constraint "prayer_likes_pkey" PRIMARY KEY using index "prayer_likes_pkey";

alter table "public"."user_achievements" add constraint "user_achievements_pkey" PRIMARY KEY using index "user_achievements_pkey";

alter table "public"."achievements" add constraint "achievements_requirement_type_check" CHECK ((requirement_type = ANY (ARRAY['chapters_read'::text, 'days_streak'::text, 'prayers_shared'::text]))) not valid;

alter table "public"."achievements" validate constraint "achievements_requirement_type_check";

alter table "public"."daily_readings" add constraint "daily_readings_date_key" UNIQUE using index "daily_readings_date_key";

alter table "public"."daily_scripture_selections" add constraint "daily_scripture_selections_selected_verse_id_fkey" FOREIGN KEY (selected_verse_id) REFERENCES scriptures(id) not valid;

alter table "public"."daily_scripture_selections" validate constraint "daily_scripture_selections_selected_verse_id_fkey";

alter table "public"."daily_scripture_selections" add constraint "daily_scripture_selections_user_id_date_key" UNIQUE using index "daily_scripture_selections_user_id_date_key";

alter table "public"."daily_scripture_selections" add constraint "daily_scripture_selections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."daily_scripture_selections" validate constraint "daily_scripture_selections_user_id_fkey";

alter table "public"."groups" add constraint "groups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) not valid;

alter table "public"."groups" validate constraint "groups_created_by_fkey";

alter table "public"."groups" add constraint "groups_name_key" UNIQUE using index "groups_name_key";

alter table "public"."prayer_requests" add constraint "prayer_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."prayer_requests" validate constraint "prayer_requests_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'moderator'::text, 'user'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."reading_progress" add constraint "reading_progress_scripture_id_fkey" FOREIGN KEY (scripture_id) REFERENCES scriptures(id) ON DELETE CASCADE not valid;

alter table "public"."reading_progress" validate constraint "reading_progress_scripture_id_fkey";

alter table "public"."reading_progress" add constraint "reading_progress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reading_progress" validate constraint "reading_progress_user_id_fkey";

alter table "public"."scriptures" add constraint "scriptures_book_chapter_verse_key" UNIQUE using index "scriptures_book_chapter_verse_key";

alter table "public"."social_shares" add constraint "social_shares_content_type_check" CHECK ((content_type = ANY (ARRAY['prayer'::text, 'achievement'::text, 'scripture'::text]))) not valid;

alter table "public"."social_shares" validate constraint "social_shares_content_type_check";

alter table "public"."social_shares" add constraint "social_shares_platform_check" CHECK ((platform = ANY (ARRAY['facebook'::text, 'line'::text, 'twitter'::text]))) not valid;

alter table "public"."social_shares" validate constraint "social_shares_platform_check";

alter table "public"."social_shares" add constraint "social_shares_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."social_shares" validate constraint "social_shares_user_id_fkey";

alter table "public"."user_achievements" add constraint "user_achievements_achievement_id_fkey" FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE not valid;

alter table "public"."user_achievements" validate constraint "user_achievements_achievement_id_fkey";

alter table "public"."user_groups" add constraint "user_groups_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."user_groups" validate constraint "user_groups_group_id_fkey";

alter table "public"."user_groups" add constraint "user_groups_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_groups" validate constraint "user_groups_user_id_fkey";

alter table "public"."yearly_reading_plan" add constraint "yearly_reading_plan_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."yearly_reading_plan" validate constraint "yearly_reading_plan_user_id_fkey";

alter table "public"."yearly_reading_plan" add constraint "yearly_reading_plan_user_id_year_key" UNIQUE using index "yearly_reading_plan_user_id_year_key";

alter table "public"."prayer_comments" add constraint "prayer_comments_prayer_id_fkey" FOREIGN KEY (prayer_id) REFERENCES prayer_requests(id) ON DELETE CASCADE not valid;

alter table "public"."prayer_comments" validate constraint "prayer_comments_prayer_id_fkey";

alter table "public"."prayer_comments" add constraint "prayer_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."prayer_comments" validate constraint "prayer_comments_user_id_fkey";

alter table "public"."prayer_likes" add constraint "prayer_likes_prayer_id_fkey" FOREIGN KEY (prayer_id) REFERENCES prayer_requests(id) ON DELETE CASCADE not valid;

alter table "public"."prayer_likes" validate constraint "prayer_likes_prayer_id_fkey";

alter table "public"."prayer_likes" add constraint "prayer_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."prayer_likes" validate constraint "prayer_likes_user_id_fkey";

alter table "public"."user_achievements" add constraint "user_achievements_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_achievements" validate constraint "user_achievements_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_random_verses(count integer DEFAULT 3)
 RETURNS SETOF scriptures
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT * FROM scriptures
  ORDER BY random()
  LIMIT count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_reading_progress()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update yearly reading plan
  UPDATE yearly_reading_plan 
  SET chapters_read = chapters_read + 1
  WHERE user_id = NEW.user_id AND year = EXTRACT(YEAR FROM CURRENT_DATE);
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."achievements" to "anon";

grant insert on table "public"."achievements" to "anon";

grant references on table "public"."achievements" to "anon";

grant select on table "public"."achievements" to "anon";

grant trigger on table "public"."achievements" to "anon";

grant truncate on table "public"."achievements" to "anon";

grant update on table "public"."achievements" to "anon";

grant delete on table "public"."achievements" to "authenticated";

grant insert on table "public"."achievements" to "authenticated";

grant references on table "public"."achievements" to "authenticated";

grant select on table "public"."achievements" to "authenticated";

grant trigger on table "public"."achievements" to "authenticated";

grant truncate on table "public"."achievements" to "authenticated";

grant update on table "public"."achievements" to "authenticated";

grant delete on table "public"."achievements" to "service_role";

grant insert on table "public"."achievements" to "service_role";

grant references on table "public"."achievements" to "service_role";

grant select on table "public"."achievements" to "service_role";

grant trigger on table "public"."achievements" to "service_role";

grant truncate on table "public"."achievements" to "service_role";

grant update on table "public"."achievements" to "service_role";

grant delete on table "public"."daily_readings" to "anon";

grant insert on table "public"."daily_readings" to "anon";

grant references on table "public"."daily_readings" to "anon";

grant select on table "public"."daily_readings" to "anon";

grant trigger on table "public"."daily_readings" to "anon";

grant truncate on table "public"."daily_readings" to "anon";

grant update on table "public"."daily_readings" to "anon";

grant delete on table "public"."daily_readings" to "authenticated";

grant insert on table "public"."daily_readings" to "authenticated";

grant references on table "public"."daily_readings" to "authenticated";

grant select on table "public"."daily_readings" to "authenticated";

grant trigger on table "public"."daily_readings" to "authenticated";

grant truncate on table "public"."daily_readings" to "authenticated";

grant update on table "public"."daily_readings" to "authenticated";

grant delete on table "public"."daily_readings" to "service_role";

grant insert on table "public"."daily_readings" to "service_role";

grant references on table "public"."daily_readings" to "service_role";

grant select on table "public"."daily_readings" to "service_role";

grant trigger on table "public"."daily_readings" to "service_role";

grant truncate on table "public"."daily_readings" to "service_role";

grant update on table "public"."daily_readings" to "service_role";

grant delete on table "public"."daily_scripture_selections" to "anon";

grant insert on table "public"."daily_scripture_selections" to "anon";

grant references on table "public"."daily_scripture_selections" to "anon";

grant select on table "public"."daily_scripture_selections" to "anon";

grant trigger on table "public"."daily_scripture_selections" to "anon";

grant truncate on table "public"."daily_scripture_selections" to "anon";

grant update on table "public"."daily_scripture_selections" to "anon";

grant delete on table "public"."daily_scripture_selections" to "authenticated";

grant insert on table "public"."daily_scripture_selections" to "authenticated";

grant references on table "public"."daily_scripture_selections" to "authenticated";

grant select on table "public"."daily_scripture_selections" to "authenticated";

grant trigger on table "public"."daily_scripture_selections" to "authenticated";

grant truncate on table "public"."daily_scripture_selections" to "authenticated";

grant update on table "public"."daily_scripture_selections" to "authenticated";

grant delete on table "public"."daily_scripture_selections" to "service_role";

grant insert on table "public"."daily_scripture_selections" to "service_role";

grant references on table "public"."daily_scripture_selections" to "service_role";

grant select on table "public"."daily_scripture_selections" to "service_role";

grant trigger on table "public"."daily_scripture_selections" to "service_role";

grant truncate on table "public"."daily_scripture_selections" to "service_role";

grant update on table "public"."daily_scripture_selections" to "service_role";

grant delete on table "public"."groups" to "anon";

grant insert on table "public"."groups" to "anon";

grant references on table "public"."groups" to "anon";

grant select on table "public"."groups" to "anon";

grant trigger on table "public"."groups" to "anon";

grant truncate on table "public"."groups" to "anon";

grant update on table "public"."groups" to "anon";

grant delete on table "public"."groups" to "authenticated";

grant insert on table "public"."groups" to "authenticated";

grant references on table "public"."groups" to "authenticated";

grant select on table "public"."groups" to "authenticated";

grant trigger on table "public"."groups" to "authenticated";

grant truncate on table "public"."groups" to "authenticated";

grant update on table "public"."groups" to "authenticated";

grant delete on table "public"."groups" to "service_role";

grant insert on table "public"."groups" to "service_role";

grant references on table "public"."groups" to "service_role";

grant select on table "public"."groups" to "service_role";

grant trigger on table "public"."groups" to "service_role";

grant truncate on table "public"."groups" to "service_role";

grant update on table "public"."groups" to "service_role";

grant delete on table "public"."prayer_requests" to "anon";

grant insert on table "public"."prayer_requests" to "anon";

grant references on table "public"."prayer_requests" to "anon";

grant select on table "public"."prayer_requests" to "anon";

grant trigger on table "public"."prayer_requests" to "anon";

grant truncate on table "public"."prayer_requests" to "anon";

grant update on table "public"."prayer_requests" to "anon";

grant delete on table "public"."prayer_requests" to "authenticated";

grant insert on table "public"."prayer_requests" to "authenticated";

grant references on table "public"."prayer_requests" to "authenticated";

grant select on table "public"."prayer_requests" to "authenticated";

grant trigger on table "public"."prayer_requests" to "authenticated";

grant truncate on table "public"."prayer_requests" to "authenticated";

grant update on table "public"."prayer_requests" to "authenticated";

grant delete on table "public"."prayer_requests" to "service_role";

grant insert on table "public"."prayer_requests" to "service_role";

grant references on table "public"."prayer_requests" to "service_role";

grant select on table "public"."prayer_requests" to "service_role";

grant trigger on table "public"."prayer_requests" to "service_role";

grant truncate on table "public"."prayer_requests" to "service_role";

grant update on table "public"."prayer_requests" to "service_role";

grant delete on table "public"."reading_progress" to "anon";

grant insert on table "public"."reading_progress" to "anon";

grant references on table "public"."reading_progress" to "anon";

grant select on table "public"."reading_progress" to "anon";

grant trigger on table "public"."reading_progress" to "anon";

grant truncate on table "public"."reading_progress" to "anon";

grant update on table "public"."reading_progress" to "anon";

grant delete on table "public"."reading_progress" to "authenticated";

grant insert on table "public"."reading_progress" to "authenticated";

grant references on table "public"."reading_progress" to "authenticated";

grant select on table "public"."reading_progress" to "authenticated";

grant trigger on table "public"."reading_progress" to "authenticated";

grant truncate on table "public"."reading_progress" to "authenticated";

grant update on table "public"."reading_progress" to "authenticated";

grant delete on table "public"."reading_progress" to "service_role";

grant insert on table "public"."reading_progress" to "service_role";

grant references on table "public"."reading_progress" to "service_role";

grant select on table "public"."reading_progress" to "service_role";

grant trigger on table "public"."reading_progress" to "service_role";

grant truncate on table "public"."reading_progress" to "service_role";

grant update on table "public"."reading_progress" to "service_role";

grant delete on table "public"."scriptures" to "anon";

grant insert on table "public"."scriptures" to "anon";

grant references on table "public"."scriptures" to "anon";

grant select on table "public"."scriptures" to "anon";

grant trigger on table "public"."scriptures" to "anon";

grant truncate on table "public"."scriptures" to "anon";

grant update on table "public"."scriptures" to "anon";

grant delete on table "public"."scriptures" to "authenticated";

grant insert on table "public"."scriptures" to "authenticated";

grant references on table "public"."scriptures" to "authenticated";

grant select on table "public"."scriptures" to "authenticated";

grant trigger on table "public"."scriptures" to "authenticated";

grant truncate on table "public"."scriptures" to "authenticated";

grant update on table "public"."scriptures" to "authenticated";

grant delete on table "public"."scriptures" to "service_role";

grant insert on table "public"."scriptures" to "service_role";

grant references on table "public"."scriptures" to "service_role";

grant select on table "public"."scriptures" to "service_role";

grant trigger on table "public"."scriptures" to "service_role";

grant truncate on table "public"."scriptures" to "service_role";

grant update on table "public"."scriptures" to "service_role";

grant delete on table "public"."social_shares" to "anon";

grant insert on table "public"."social_shares" to "anon";

grant references on table "public"."social_shares" to "anon";

grant select on table "public"."social_shares" to "anon";

grant trigger on table "public"."social_shares" to "anon";

grant truncate on table "public"."social_shares" to "anon";

grant update on table "public"."social_shares" to "anon";

grant delete on table "public"."social_shares" to "authenticated";

grant insert on table "public"."social_shares" to "authenticated";

grant references on table "public"."social_shares" to "authenticated";

grant select on table "public"."social_shares" to "authenticated";

grant trigger on table "public"."social_shares" to "authenticated";

grant truncate on table "public"."social_shares" to "authenticated";

grant update on table "public"."social_shares" to "authenticated";

grant delete on table "public"."social_shares" to "service_role";

grant insert on table "public"."social_shares" to "service_role";

grant references on table "public"."social_shares" to "service_role";

grant select on table "public"."social_shares" to "service_role";

grant trigger on table "public"."social_shares" to "service_role";

grant truncate on table "public"."social_shares" to "service_role";

grant update on table "public"."social_shares" to "service_role";

grant delete on table "public"."user_groups" to "anon";

grant insert on table "public"."user_groups" to "anon";

grant references on table "public"."user_groups" to "anon";

grant select on table "public"."user_groups" to "anon";

grant trigger on table "public"."user_groups" to "anon";

grant truncate on table "public"."user_groups" to "anon";

grant update on table "public"."user_groups" to "anon";

grant delete on table "public"."user_groups" to "authenticated";

grant insert on table "public"."user_groups" to "authenticated";

grant references on table "public"."user_groups" to "authenticated";

grant select on table "public"."user_groups" to "authenticated";

grant trigger on table "public"."user_groups" to "authenticated";

grant truncate on table "public"."user_groups" to "authenticated";

grant update on table "public"."user_groups" to "authenticated";

grant delete on table "public"."user_groups" to "service_role";

grant insert on table "public"."user_groups" to "service_role";

grant references on table "public"."user_groups" to "service_role";

grant select on table "public"."user_groups" to "service_role";

grant trigger on table "public"."user_groups" to "service_role";

grant truncate on table "public"."user_groups" to "service_role";

grant update on table "public"."user_groups" to "service_role";

grant delete on table "public"."yearly_reading_plan" to "anon";

grant insert on table "public"."yearly_reading_plan" to "anon";

grant references on table "public"."yearly_reading_plan" to "anon";

grant select on table "public"."yearly_reading_plan" to "anon";

grant trigger on table "public"."yearly_reading_plan" to "anon";

grant truncate on table "public"."yearly_reading_plan" to "anon";

grant update on table "public"."yearly_reading_plan" to "anon";

grant delete on table "public"."yearly_reading_plan" to "authenticated";

grant insert on table "public"."yearly_reading_plan" to "authenticated";

grant references on table "public"."yearly_reading_plan" to "authenticated";

grant select on table "public"."yearly_reading_plan" to "authenticated";

grant trigger on table "public"."yearly_reading_plan" to "authenticated";

grant truncate on table "public"."yearly_reading_plan" to "authenticated";

grant update on table "public"."yearly_reading_plan" to "authenticated";

grant delete on table "public"."yearly_reading_plan" to "service_role";

grant insert on table "public"."yearly_reading_plan" to "service_role";

grant references on table "public"."yearly_reading_plan" to "service_role";

grant select on table "public"."yearly_reading_plan" to "service_role";

grant trigger on table "public"."yearly_reading_plan" to "service_role";

grant truncate on table "public"."yearly_reading_plan" to "service_role";

grant update on table "public"."yearly_reading_plan" to "service_role";

create policy "Admins can manage daily readings"
on "public"."daily_readings"
as permissive
for all
to public
using (((auth.jwt() ->> 'role'::text) = 'admin'::text))
with check (((auth.jwt() ->> 'role'::text) = 'admin'::text));


create policy "Daily readings are publicly readable"
on "public"."daily_readings"
as permissive
for select
to public
using (true);


create policy "Allow authenticated users to create groups"
on "public"."groups"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow authenticated users to view groups"
on "public"."groups"
as permissive
for select
to authenticated
using (true);


create policy "Allow creators or admins to delete groups"
on "public"."groups"
as permissive
for delete
to authenticated
using (((auth.uid() = created_by) OR (( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::text)));


create policy "Allow creators or admins to update groups"
on "public"."groups"
as permissive
for update
to authenticated
using (((auth.uid() = created_by) OR (( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::text)))
with check (((auth.uid() = created_by) OR (( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::text)));


CREATE TRIGGER update_daily_readings_updated_at BEFORE UPDATE ON public.daily_readings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON public.prayer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER reading_progress_trigger AFTER INSERT ON public.reading_progress FOR EACH ROW EXECUTE FUNCTION update_reading_progress();


