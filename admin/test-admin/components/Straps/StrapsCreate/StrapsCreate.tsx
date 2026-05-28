import { Create } from "react-admin";
import { STRAPS_TYPES } from "../../../constants/goodsTypes";
import { useGoodsCreation } from "../../../hooks/useGoodsCreation";
import { StrapsForm } from "../StrapsForm/StrapsForm";

export const StrapsCreate = () => {
  const { type, handleSelectType, maxImagesCount } =
    useGoodsCreation(STRAPS_TYPES);
  return (
    <Create>
      <StrapsForm
        type={type}
        handleSelectType={handleSelectType}
        maxImagesCount={maxImagesCount}
      />
    </Create>
  );
};
