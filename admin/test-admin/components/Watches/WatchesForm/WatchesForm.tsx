import "../../index.css";
import {
  CheckboxGroupInput,
  ImageField,
  ImageInput,
  NumberInput,
  required,
  SelectInput,
  TabbedForm,
  TextInput,
} from "react-admin";
import {
  WATCHES_TYPES,
  GOODS_IS_BESTSELLER,
  GOODS_IS_NEW,
  GOODS_POPULARITY,
  WATCHES_SIZES,
} from "../../../constants/goodsTypes";
import {
  WATCH_BRANDS,
  WATCH_MECHANISMS,
  WATCH_GLASS_TYPES,
  WATCH_CASE_MATERIALS,
  WATCH_STRAP_MATERIALS,
  WATCH_CASE_COLORS,
  WATCH_DIAL_COLORS,
  WATCH_COLLECTIONS,
  WATCH_GENDERS,
} from "../../../constants/goodsCharacteristics";
import { IBaseFormProps } from "../../../types/goods";
import { allowedImageExtensions } from "../../../utils/validation";

export const WatchesForm = ({
  handleSelectType,
  maxImagesCount,
}: IBaseFormProps) => (
  <TabbedForm>
    <TabbedForm.Tab label="Основна інформація">
      <div className="block">
        <SelectInput
          className="block__select"
          choices={WATCHES_TYPES}
          source="type"
          validate={[required()]}
          onChange={handleSelectType}
          optionValue="name"
        />
        <NumberInput
          min={0}
          className="block__select"
          source="price"
          validate={[required()]}
        />
        <TextInput
          className="block__select"
          source="name"
          validate={[required()]}
          resettable
        />
        <TextInput
          className="block__select"
          source="vendorCode"
          validate={[required()]}
          resettable
        />
        <NumberInput
          min={0}
          className="block__select"
          source="inStock"
          validate={[required()]}
        />
        <TextInput
          source="description"
          validate={[required()]}
          multiline
          resettable
        />
      </div>
      <div className="block-right">
        <SelectInput
          className="block__select"
          choices={GOODS_POPULARITY}
          source="popularity"
          validate={[required()]}
          optionValue="name"
        />
        <CheckboxGroupInput
          source="sizes"
          choices={WATCHES_SIZES}
          optionValue="name"
          label="Розміри корпусу (мм)"
        />
        <CheckboxGroupInput
          source="isNew"
          choices={GOODS_IS_NEW}
          optionValue="name"
        />
        <CheckboxGroupInput
          source="isBestseller"
          choices={GOODS_IS_BESTSELLER}
          optionValue="name"
        />
      </div>
      <ImageInput
        maxSize={3000000}
        label="Зображення"
        source="images"
        validate={[allowedImageExtensions(), maxImagesCount(), required()]}
        multiple
      >
        <>
          <ImageField source="url" title="desc" />
          <ImageField source="src" title="title" />
        </>
      </ImageInput>
    </TabbedForm.Tab>
    <TabbedForm.Tab label="Характеристики">
      <div className="block">
        <SelectInput
          className="block__select"
          choices={WATCH_BRANDS}
          source="characteristics.brand"
          validate={[required()]}
          defaultValue={WATCH_BRANDS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={WATCH_MECHANISMS}
          source="characteristics.mechanism"
          validate={[required()]}
          defaultValue={WATCH_MECHANISMS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={WATCH_GLASS_TYPES}
          source="characteristics.glassType"
          validate={[required()]}
          defaultValue={WATCH_GLASS_TYPES[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={WATCH_CASE_MATERIALS}
          source="characteristics.caseMaterial"
          validate={[required()]}
          defaultValue={WATCH_CASE_MATERIALS[0].name}
          optionValue="name"
        />
      </div>
      <div className="block">
        <SelectInput
          className="block__select"
          choices={WATCH_STRAP_MATERIALS}
          source="characteristics.strapMaterial"
          validate={[required()]}
          defaultValue={WATCH_STRAP_MATERIALS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={WATCH_CASE_COLORS}
          source="characteristics.caseColor"
          validate={[required()]}
          defaultValue={WATCH_CASE_COLORS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={WATCH_DIAL_COLORS}
          source="characteristics.dialColor"
          validate={[required()]}
          defaultValue={WATCH_DIAL_COLORS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={WATCH_COLLECTIONS}
          source="characteristics.collection"
          validate={[required()]}
          defaultValue={WATCH_COLLECTIONS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={WATCH_GENDERS}
          source="characteristics.gender"
          validate={[required()]}
          defaultValue={WATCH_GENDERS[0].name}
          optionValue="name"
        />
      </div>
    </TabbedForm.Tab>
  </TabbedForm>
);
