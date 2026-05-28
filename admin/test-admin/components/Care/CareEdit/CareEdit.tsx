import { Edit } from "react-admin";
import { CARE_SOURCE_NAME } from "../../../constants/sourceNames";
import { CARE_TYPES } from "../../../constants/goodsTypes";
import { useGoodsEdition } from "../../../hooks/useGoodsEdition";
import { EditTopToolbar } from "../../elements/EditTopToolbar/EditTopToolbar";
import { CareForm } from "../CareForm/CareForm";

export const CareEdit = () => {
  const {
    type,
    handleSelectType,
    maxImagesCount,
    handleClone,
    cloneProductSpinner,
  } = useGoodsEdition(CARE_SOURCE_NAME, CARE_TYPES);
  return (
    <Edit
      actions={
        <EditTopToolbar
          handleClone={handleClone}
          spinner={cloneProductSpinner}
        />
      }
    >
      <CareForm
        type={type}
        handleSelectType={handleSelectType}
        maxImagesCount={maxImagesCount}
      />
    </Edit>
  );
};
