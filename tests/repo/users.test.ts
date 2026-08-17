import { beforeEach, describe, expect, it, vi } from "vitest";

const { fromMock, upsertMock, selectMock, singleMock } = vi.hoisted(() => {
  const singleMock = vi.fn();
  const selectMock = vi.fn(() => ({ single: singleMock }));
  const upsertMock = vi.fn(() => ({ select: selectMock }));
  const fromMock = vi.fn(() => ({ upsert: upsertMock }));
  return { fromMock, upsertMock, selectMock, singleMock };
});

vi.mock("../../src/supabase.js", () => ({
  supabase: { from: fromMock },
}));

import { getOrCreateUser } from "../../src/repo/users.js";

const row = {
  id: 1,
  kakao_user_id: "u1",
  corps: null,
  allergy_show: true,
  date_to_join_the_army: null,
  discharge_date: null,
  usage_count: {},
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOrCreateUser", () => {
  it("upserts on kakao_user_id (atomic, race-safe) and returns the row", async () => {
    singleMock.mockResolvedValue({ data: row, error: null });

    const result = await getOrCreateUser("u1");

    expect(fromMock).toHaveBeenCalledWith("users");
    expect(upsertMock).toHaveBeenCalledWith(
      { kakao_user_id: "u1" },
      { onConflict: "kakao_user_id", ignoreDuplicates: false },
    );
    expect(result).toEqual(row);
  });

  it("throws when Supabase returns an error", async () => {
    singleMock.mockResolvedValue({ data: null, error: new Error("boom") });

    await expect(getOrCreateUser("u1")).rejects.toThrow("boom");
  });
});
