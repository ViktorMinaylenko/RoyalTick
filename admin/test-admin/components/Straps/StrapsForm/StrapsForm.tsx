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
  BooleanInput,
} from "react-admin";
import {
  STRAPS_TYPES,
  GOODS_IS_BESTSELLER,
  GOODS_IS_NEW,
  GOODS_POPULARITY,
  STRAPS_SIZES,
} from "../../../constants/goodsTypes";
import {
  STRAP_COLLECTIONS,
  STRAP_MATERIALS,
  STRAP_CLASP_TYPES,
  STRAP_TEXTURES,
  STRAP_PATTERNS,
} from "../../../constants/goodsCharacteristics";
import { IBaseFormProps } from "../../../types/goods";
import { allowedImageExtensions } from "../../../utils/validation";

export const StrapsForm = ({
  handleSelectType,
  maxImagesCount,
}: IBaseFormProps) => (
  <TabbedForm>
    <TabbedForm.Tab label="Основна інформація">
      <div className="block">
        <SelectInput
          className="block__select"
          choices={STRAPS_TYPES}
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
          choices={STRAPS_SIZES}
          optionValue="name"
          label="Розміри (мм)"
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
          choices={STRAP_COLLECTIONS}
          source="characteristics.collection"
          validate={[required()]}
          defaultValue={STRAP_COLLECTIONS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={STRAP_MATERIALS}
          source="characteristics.material"
          validate={[required()]}
          defaultValue={STRAP_MATERIALS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={STRAP_CLASP_TYPES}
          source="characteristics.claspType"
          validate={[required()]}
          defaultValue={STRAP_CLASP_TYPES[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={STRAP_TEXTURES}
          source="characteristics.texture"
          validate={[required()]}
          defaultValue={STRAP_TEXTURES[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={STRAP_PATTERNS}
          source="characteristics.pattern"
          validate={[required()]}
          defaultValue={STRAP_PATTERNS[0].name}
          optionValue="name"
        />
      </div>
      <BooleanInput
        source="characteristics.waterResistant"
        label="Водостійкий"
      />
    </TabbedForm.Tab>
  </TabbedForm>
);
