import { DataProvider, fetchUtils } from "react-admin";
import { stringify } from "query-string";
import axios from "axios";

const apiUrl = "http://localhost:3000/api/admin";
const httpClient = fetchUtils.fetchJson;

export default {
  getList: async (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination ?? {};
    const { field = "id", order = "ASC" } = params.sort ?? {};

    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter ?? {}),
    };

    const url = `${apiUrl}/${resource}/list?${stringify(query)}`;
    const { data } = await axios.get(url);

    return {
      data: data.items,
      total: data.count,
    };
  },

  getOne: async (resource, params) => {
    const rawCategory = localStorage.getItem("show");
    const category = rawCategory ? JSON.parse(rawCategory) : "";

    const url = `${apiUrl}/${resource}/one?id=${params.id}&category=${category}`;

    const { data } = await axios.get(url);

    return {
      data: data.productItem,
    };
  },

  getMany: async (resource, params) => {
    const query = {
      filter: JSON.stringify({ ids: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json } = await httpClient(url);
    return { data: json };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json, headers } = await httpClient(url);
    const contentRange = headers.get("content-range");

    const total = contentRange
      ? parseInt(contentRange.split("/").pop() ?? "0", 10)
      : 0;

    return {
      data: json,
      total,
    };
  },

  create: async (resource, params) => {
    const { json } = await httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  delete: async (resource, params) => {
    if (!params.previousData) {
      throw new Error("No previousData provided for delete operation");
    }

    const id = params.previousData.id;
    const category = params.previousData.category;

    const categoryMap: Record<string, string> = {
      watches: "watches",
      straps: "straps",
      accessories: "boxes",
    };

    const mongoCollection = categoryMap[category] ?? category;

    const url = `${apiUrl}/${resource}/delete?id=${id}&category=${mongoCollection}`;
    const { data } = await axios.get(url);

    return { data };
  },

  deleteMany: async (resource, params) => {
    const url = `${apiUrl}/${resource}/delete-many?ids=${encodeURIComponent(JSON.stringify(params.ids))}`;

    await axios.get(url);

    return {
      data: [],
    };
  },
} as DataProvider;
