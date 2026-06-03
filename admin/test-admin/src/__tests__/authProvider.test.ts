import { authProvider } from "../authProvider";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../api/apiInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/apiInstance";
const mockedApi = vi.mocked(api) as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe("authProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should login with correct credentials", async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        accessToken: "token",
        refreshToken: "refresh",
        role: "admin",
        username: "admin",
      },
    });

    await expect(
      authProvider.login({ username: "admin", password: "password" }),
    ).resolves.toBeUndefined();
  });

  it("should fail login with incorrect credentials", async () => {
    mockedApi.post.mockResolvedValue({
      data: { warningMessage: "Невірний логін або пароль!" },
    });

    await expect(
      authProvider.login({ username: "bad", password: "bad" }),
    ).rejects.toBeDefined();
  });

  it("should remove user from localStorage on logout", async () => {
    localStorage.setItem("auth", JSON.stringify({ accessToken: "token" }));
    await authProvider.logout({});
    expect(localStorage.getItem("auth")).toBeNull();
  });

  it("checkAuth should resolve when user is present", async () => {
    localStorage.setItem(
      "auth",
      JSON.stringify({ accessToken: "token", refreshToken: "refresh" }),
    );
    mockedApi.get.mockResolvedValue({ data: {} });

    await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
  });

  it("checkAuth should reject when user is missing", async () => {
    await expect(authProvider.checkAuth({})).rejects.toBeUndefined();
  });

  it("getIdentity should return null when user is not logged in", async () => {
    const user = await authProvider.getIdentity?.();
    expect(user).toBeNull();
  });
});
