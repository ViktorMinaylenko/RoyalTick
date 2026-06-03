import dataProvider from "../dataProvider";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../api/apiInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/apiInstance";
const mockedApi = vi.mocked(api) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe("dataProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("getList handles pagination params", async () => {
    mockedApi.get.mockResolvedValue({ data: { items: [], count: 0 } });

    await dataProvider.getList("goods", {
      pagination: { page: 2, perPage: 20 },
      sort: { field: "price", order: "DESC" },
    });

    expect(mockedApi.get).toHaveBeenCalledWith(
      expect.stringContaining("range=%5B20%2C39%5D"),
    );
  });

  it("getOne calls API with correct category param", async () => {
    mockedApi.get.mockResolvedValue({
      data: { _id: "123", sizes: {}, isNew: false, isBestseller: false },
    });

    await dataProvider.getOne("watches", { id: "123" });

    expect(mockedApi.get).toHaveBeenCalledWith(
      expect.stringContaining("category=watches"),
    );
  });

  it("create sends correct body", async () => {
    mockedApi.post.mockResolvedValue({
      data: { newItem: { _id: "1", name: "New Watch" } },
    });

    const result = await dataProvider.create("watches", {
      data: { name: "New Watch", sizes: [], images: [] },
    });

    expect(result.data).toBeDefined();
    expect(mockedApi.post).toHaveBeenCalledWith(
      "/admin/add-product",
      expect.objectContaining({ category: "watches" }),
    );
  });

  it("delete maps accessories to boxes", async () => {
    mockedApi.delete.mockResolvedValue({ data: {} });

    await dataProvider.delete("boxes", {
      id: "1",
      previousData: { id: "1" },
    });

    expect(mockedApi.delete).toHaveBeenCalledWith(
      expect.stringContaining("category=boxes"),
    );
  });

  it("deleteMany joins ids correctly in URL", async () => {
    mockedApi.delete.mockResolvedValue({ data: [] });

    await dataProvider.deleteMany("goods", { ids: ["1", "2"] });

    expect(mockedApi.delete).toHaveBeenCalledWith(
      expect.stringContaining("ids=%5B%221%22%2C%222%22%5D"),
    );
  });

  it("should handle API network error gracefully", async () => {
    mockedApi.get.mockRejectedValue(new Error("Network Error"));

    await expect(dataProvider.getList("goods", {})).rejects.toThrow(
      "Network Error",
    );
  });
});
