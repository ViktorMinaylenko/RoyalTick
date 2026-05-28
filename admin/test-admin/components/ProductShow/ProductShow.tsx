/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  DeleteButton,
  TopToolbar,
  RichTextField,
  EditButton,
  ArrayField,
  SingleFieldList,
  FunctionField,
} from "react-admin";

const BASE_URL = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "");

export const ProductShow = () => (
  <Show
    actions={
      <TopToolbar>
        <EditButton />
        <DeleteButton />
      </TopToolbar>
    }
  >
    <SimpleShowLayout>
      <ArrayField source="images" label="Зображення">
        <SingleFieldList linkType={false}>
          <FunctionField
            render={(img: unknown) => {
              const src =
                typeof img === "string"
                  ? `${BASE_URL}${img}`
                  : (img as any)?.url || (img as any)?.src || "";
              return (
                <img
                  src={src}
                  alt="product"
                  style={{
                    maxHeight: 200,
                    maxWidth: 200,
                    objectFit: "contain",
                    margin: 4,
                  }}
                />
              );
            }}
          />
        </SingleFieldList>
      </ArrayField>
      <TextField source="name" label="Назва" />
      <TextField source="category" label="Категорія" />
      <TextField source="type" label="Тип" />
      <NumberField source="price" label="Ціна" />
      <NumberField source="inStock" label="В наявності" />
      <TextField source="vendorCode" label="Артикул" />
      <RichTextField source="description" label="Опис" />
    </SimpleShowLayout>
  </Show>
);
