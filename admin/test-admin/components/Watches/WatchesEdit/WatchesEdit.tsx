import { Edit } from "react-admin";
import { WATCHES_SOURCE_NAME } from "../../../constants/sourceNames";
import { WATCHES_TYPES } from "../../../constants/goodsTypes";
import { useGoodsEdition } from "../../../hooks/useGoodsEdition";
import { EditTopToolbar } from "../../elements/EditTopToolbar/EditTopToolbar";
import { WatchesForm } from "../WatchesForm/WatchesForm";

export const WatchesEdit = () => {
  const {
    type,
    handleSelectType,
    maxImagesCount,
    handleClone,
    cloneProductSpinner,
  } = useGoodsEdition(WATCHES_SOURCE_NAME, WATCHES_TYPES);
  return (
    <Edit
      actions={
        <EditTopToolbar
          handleClone={handleClone}
          spinner={cloneProductSpinner}
        />
      }
    >
      <WatchesForm
        type={type}
        handleSelectType={handleSelectType}
        maxImagesCount={maxImagesCount}
      />
    </Edit>
  );
};
