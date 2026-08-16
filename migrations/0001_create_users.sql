create table users (
    id bigint generated always as identity primary key,
    kakao_user_id text not null unique,
    corps text,
    allergy_show boolean not null default true,
    date_to_join_the_army date,
    discharge_date date,
    usage_count jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table users enable row level security;
