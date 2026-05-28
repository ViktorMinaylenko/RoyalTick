import { Create } from "react-admin";
import { WATCHES_TYPES } from "../../../constants/goodsTypes";
import { useGoodsCreation } from "../../../hooks/useGoodsCreation";
import { WatchesForm } from "../WatchesForm/WatchesForm";

export const WatchesCreate = () => {
  const { type, handleSelectType, maxImagesCount } =
    useGoodsCreation(WATCHES_TYPES);
  return (
    <Create>
      <WatchesForm
        type={type}
        handleSelectType={handleSelectType}
        maxImagesCount={maxImagesCount}
      />
    </Create>
  );
};
