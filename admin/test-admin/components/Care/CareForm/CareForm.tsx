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
  CARE_TYPES,
  GOODS_IS_BESTSELLER,
  GOODS_IS_NEW,
  GOODS_POPULARITY,
} from "../../../constants/goodsTypes";
import {
  CARE_COLORS,
  CARE_COMPONENTS,
  CARE_SURFACES,
  CARE_PACKAGINGS,
  CARE_PECULIARITIES,
} from "../../../constants/goodsCharacteristics";
import { IBaseFormProps } from "../../../types/goods";
import { allowedImageExtensions } from "../../../utils/validation";

export const CareForm = ({
  handleSelectType,
  maxImagesCount,
}: IBaseFormProps) => (
  <TabbedForm>
    <TabbedForm.Tab label="Основна інформація">
      <div className="block">
        <SelectInput
          className="block__select"
          choices={CARE_TYPES}
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
          choices={CARE_COLORS}
          source="characteristics.color"
          validate={[required()]}
          defaultValue={CARE_COLORS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={CARE_COMPONENTS}
          source="characteristics.component"
          validate={[required()]}
          defaultValue={CARE_COMPONENTS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={CARE_SURFACES}
          source="characteristics.surface"
          validate={[required()]}
          defaultValue={CARE_SURFACES[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={CARE_PACKAGINGS}
          source="characteristics.packaging"
          validate={[required()]}
          defaultValue={CARE_PACKAGINGS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={CARE_PECULIARITIES}
          source="characteristics.peculiarity"
          validate={[required()]}
          defaultValue={CARE_PECULIARITIES[0].name}
          optionValue="name"
        />
      </div>
    </TabbedForm.Tab>
  </TabbedForm>
);
