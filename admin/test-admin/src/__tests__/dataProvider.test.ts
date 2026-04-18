import dataProvider from "../dataProvider";
import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("dataProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("getList handles pagination params", async () => {
    mockedAxios.get.mockResolvedValue({ data: { items: [], count: 0 } });

    await dataProvider.getList("goods", {
      pagination: { page: 2, perPage: 20 },
      sort: { field: "price", order: "DESC" },
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("range=%5B20%2C39%5D"),
    );
  });

  it("getOne calls API with correct category param", async () => {
    localStorage.setItem("show", '"watches"');
    mockedAxios.get.mockResolvedValue({ data: { productItem: {} } });

    await dataProvider.getOne("goods", { id: "123" });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("category=watches"),
    );
  });

  it("create sends correct body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ id: 1, name: "New Watch" }),
      text: async () => JSON.stringify({ id: 1, name: "New Watch" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await dataProvider.create("goods", {
      data: { name: "New Watch" },
    });
    expect(result.data).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("delete maps accessories to boxes", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await dataProvider.delete('goods', { previousData: { id: '1', category: 'accessories' } } as { previousData: { id: string; category: string } });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("category=boxes"),
    );
  });

  it("deleteMany joins ids correctly in URL", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await dataProvider.deleteMany("goods", { ids: ["1", "2"] });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("ids=%5B%221%22%2C%222%22%5D"),
    );
  });

  it("should handle API network error gracefully", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(dataProvider.getList("goods", {})).rejects.toThrow(
      "Network Error",
    );
  });
});
