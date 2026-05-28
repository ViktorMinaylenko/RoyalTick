import { Create } from "react-admin";
import { CARE_TYPES } from "../../../constants/goodsTypes";
import { useGoodsCreation } from "../../../hooks/useGoodsCreation";
import { CareForm } from "../CareForm/CareForm";

export const CareCreate = () => {
  const { type, handleSelectType, maxImagesCount } =
    useGoodsCreation(CARE_TYPES);
  return (
    <Create>
      <CareForm
        type={type}
        handleSelectType={handleSelectType}
        maxImagesCount={maxImagesCount}
      />
    </Create>
  );
};
