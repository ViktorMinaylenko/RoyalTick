/* eslint-disable @typescript-eslint/no-explicit-any */
import { stringify } from "query-string";
import { DataProvider, fetchUtils, HttpError } from "react-admin";
import api from "../api/apiInstance";
import { USERS_SOURCE_NAME } from "../constants/sourceNames";

const httpClient = fetchUtils.fetchJson;

const mapId = (item: any) => ({ ...item, id: item._id?.toString() || item.id });

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

const getImageData = async (image: any) => {
  if (!image) return null;
  if (image.rawFile) {
    const base64 = await fileToBase64(image.rawFile);
    return { src: base64, title: image.title };
  }
  if (image.src) return image;
  return null;
};

export default {
  getList: async (resource: string, params: any) => {
    const { page = 1, perPage = 10 } = params.pagination ?? {};
    const { field = "id", order = "ASC" } = params.sort ?? {};
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter ?? {}),
    };
    const { data } = await api.get(`/admin/${resource}?${stringify(query)}`);
    return {
      data: (data.items || []).map(mapId),
      total: data.count || 0,
    };
  },

  getOne: async (resource: string, params: any) => {
    const { data } = await api.get(
      `/admin/one?id=${params.id}&category=${resource}`,
    );

    if (resource === USERS_SOURCE_NAME) {
      return {
        data: {
          ...mapId(data),
          image: data.image?.url
            ? { src: data.image.url, title: data.image.desc || "avatar" }
            : null,
        },
      };
    }

    const isNew = data.isNew ? ["new"] : [];
    const isBestseller = data.isBestseller ? ["bestseller"] : [];

    if (data.sizes && Object.values(data.sizes).length) {
      const sizes: string[] = [];
      Object.entries(data.sizes).forEach(([key, value]) => {
        if (value) sizes.push(key);
      });
      return { data: { ...mapId(data), sizes, isNew, isBestseller } };
    }

    return { data: { ...mapId(data), sizes: [], isNew, isBestseller } };
  },

  getMany: async (resource: string, params: any) => {
    const query = { filter: JSON.stringify({ ids: params.ids }) };
    const { json } = await httpClient(`/${resource}?${stringify(query)}`);
    return { data: (json as any[]).map(mapId) };
  },

  getManyReference: async (resource: string, params: any) => {
    const { page = 1, perPage = 10 } = params.pagination ?? {};
    const { field = "id", order = "ASC" } = params.sort ?? {};
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({ ...params.filter, [params.target]: params.id }),
    };
    const { json } = await httpClient(`/${resource}?${stringify(query)}`);
    return { data: (json as any[]).map(mapId), total: 0 };
  },

  create: async (resource: string, params: any) => {
    if (resource === USERS_SOURCE_NAME) {
      try {
        const imageData = await getImageData(params.data.image);
        const { data } = await api.post("/admin/add-user", {
          ...params.data,
          image: imageData,
        });
        return { data: mapId(data.newUser) };
      } catch {
        return Promise.reject(
          new HttpError("Помилка створення користувача", 400),
        );
      }
    }

    const sizes = {} as Record<string, boolean>;
    const SIZES_BY_RESOURCE: Record<string, string[]> = {
      watches: ["38", "40", "42", "44"],
      straps: ["180 / 18", "200 / 20", "220 / 22", "240 / 24"],
      boxes: [],
      care: [],
    };
    const sizesList = SIZES_BY_RESOURCE[resource] || [];
    if (params.data.sizes) {
      sizesList.forEach(
        (size: string) => (sizes[size] = params.data.sizes.includes(size)),
      );
    }

    const images = params.data.images || [];
    const processedImages = await Promise.all(
      images.map(async (img: any) => {
        if (img.rawFile) {
          const base64 = await fileToBase64(img.rawFile);
          return { dataUrl: base64, title: img.title };
        }
        return img;
      }),
    );

    const { data } = await api.post("/admin/add-product", {
      ...params.data,
      category: resource,
      _id: params.data.id,
      sizes,
      images: processedImages,
      isNew: !!params.data.isNew?.length,
      isBestseller: !!params.data.isBestseller?.length,
    });

    return {
      data: {
        ...mapId(data.newItem),
        sizes: params.data.sizes,
        isNew: params.data.isNew,
        isBestseller: params.data.isBestseller,
      },
    };
  },

  update: async (resource: string, params: any) => {
    if (resource === USERS_SOURCE_NAME) {
      try {
        const imageData = await getImageData(params.data.image);
        const { data } = await api.post("/admin/edit-user", {
          ...params.data,
          _id: params.id,
          image: imageData,
        });
        return { data: mapId(data.updatedUser) };
      } catch {
        return Promise.reject(
          new HttpError("Помилка оновлення користувача", 400),
        );
      }
    }

    const sizes = {} as Record<string, boolean>;
    const SIZES_BY_RESOURCE: Record<string, string[]> = {
      watches: ["36mm", "38mm", "40mm", "42mm", "44mm", "46mm"],
      straps: ["16mm", "18mm", "20mm", "22mm", "24mm"],
      boxes: ["small", "medium", "large"],
      care: [],
    };
    const sizesList = SIZES_BY_RESOURCE[resource] || [];
    if (params.data.sizes) {
      sizesList.forEach(
        (size: string) => (sizes[size] = params.data.sizes.includes(size)),
      );
    }

    const rawImages = (params.data.images || []).filter(
      (img: any) => img.rawFile,
    );
    const oldImages = (params.data.images || []).filter((img: any) => img.url);

    const newImages = await Promise.all(
      rawImages.map(async (img: any) => {
        const base64 = await fileToBase64(img.rawFile);
        return { dataUrl: base64, title: img.title };
      }),
    );

    const { data } = await api.post("/admin/edit-product", {
      ...params.data,
      category: resource,
      _id: params.data.id,
      sizes,
      newImages,
      oldImages,
      isNew: !!params.data.isNew?.length,
      isBestseller: !!params.data.isBestseller?.length,
    });

    return {
      data: {
        ...mapId(data.updatedItem),
        sizes: params.data.sizes,
        isNew: params.data.isNew,
        isBestseller: params.data.isBestseller,
      },
    };
  },

  updateMany: async (resource: string, params: any) => {
    const { json } = await httpClient(`/${resource}`, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return { data: json as any[] };
  },

  delete: async (resource: string, params: any) => {
    const id = params.previousData?.id || params.id;
    const { data } = await api.delete(
      `/admin/delete?id=${id}&category=${resource}`,
    );
    return { data };
  },

  deleteMany: async (resource: string, params: any) => {
    await api.delete(
      `/admin/delete-many?ids=${JSON.stringify(params.ids)}&category=${resource}`,
    );
    return { data: [] };
  },
} as DataProvider;
