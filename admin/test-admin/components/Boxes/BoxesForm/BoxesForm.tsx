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
  BOXES_TYPES,
  GOODS_IS_BESTSELLER,
  GOODS_IS_NEW,
  GOODS_POPULARITY,
} from "../../../constants/goodsTypes";
import {
  BOX_MATERIALS,
  BOX_COLORS,
  BOX_CAPACITIES,
  BOX_INTERIORS,
} from "../../../constants/goodsCharacteristics";
import { IBaseFormProps } from "../../../types/goods";
import { allowedImageExtensions } from "../../../utils/validation";

export const BoxesForm = ({
  handleSelectType,
  maxImagesCount,
}: IBaseFormProps) => (
  <TabbedForm>
    <TabbedForm.Tab label="Основна інформація">
      <div className="block">
        <SelectInput
          className="block__select"
          choices={BOXES_TYPES}
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
          choices={BOX_MATERIALS}
          source="characteristics.material"
          validate={[required()]}
          defaultValue={BOX_MATERIALS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={BOX_COLORS}
          source="characteristics.color"
          validate={[required()]}
          defaultValue={BOX_COLORS[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={BOX_CAPACITIES}
          source="characteristics.capacity"
          validate={[required()]}
          defaultValue={BOX_CAPACITIES[0].name}
          optionValue="name"
        />
        <SelectInput
          className="block__select"
          choices={BOX_INTERIORS}
          source="characteristics.interior"
          validate={[required()]}
          defaultValue={BOX_INTERIORS[0].name}
          optionValue="name"
        />
        <TextInput
          className="block__select"
          source="characteristics.weight"
          validate={[required()]}
          resettable
          label="Вага (напр. 721g)"
        />
      </div>
    </TabbedForm.Tab>
  </TabbedForm>
);
