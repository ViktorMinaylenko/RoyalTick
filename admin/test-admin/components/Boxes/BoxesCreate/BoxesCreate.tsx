import { Create } from "react-admin";
import { BOXES_TYPES } from "../../../constants/goodsTypes";
import { useGoodsCreation } from "../../../hooks/useGoodsCreation";
import { BoxesForm } from "../BoxesForm/BoxesForm";

export const BoxesCreate = () => {
  const { type, handleSelectType, maxImagesCount } =
    useGoodsCreation(BOXES_TYPES);
  return (
    <Create>
      <BoxesForm
        type={type}
        handleSelectType={handleSelectType}
        maxImagesCount={maxImagesCount}
      />
    </Create>
  );
};
