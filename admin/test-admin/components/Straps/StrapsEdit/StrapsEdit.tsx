import { Edit } from "react-admin";
import { STRAPS_SOURCE_NAME } from "../../../constants/sourceNames";
import { STRAPS_TYPES } from "../../../constants/goodsTypes";
import { useGoodsEdition } from "../../../hooks/useGoodsEdition";
import { EditTopToolbar } from "../../elements/EditTopToolbar/EditTopToolbar";
import { StrapsForm } from "../StrapsForm/StrapsForm";

export const StrapsEdit = () => {
  const {
    type,
    handleSelectType,
    maxImagesCount,
    handleClone,
    cloneProductSpinner,
  } = useGoodsEdition(STRAPS_SOURCE_NAME, STRAPS_TYPES);
  return (
    <Edit
      actions={
        <EditTopToolbar
          handleClone={handleClone}
          spinner={cloneProductSpinner}
        />
      }
    >
      <StrapsForm
        type={type}
        handleSelectType={handleSelectType}
        maxImagesCount={maxImagesCount}
      />
    </Edit>
  );
};
