import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Edit,
  useGetOne,
  useGetRecordId,
  useNotify,
} from "react-admin";

import api from "../../../api/apiInstance";
import { USERS_SOURCE_NAME } from "../../../constants/sourceNames";
import { UsersForm } from "../UsersForm/UsersForm";

export const UsersEdit = () => {
  const notify = useNotify();
  const id = useGetRecordId();
  const user = useGetOne(USERS_SOURCE_NAME, { id });

  const [spinner, setSpinner] = useState(false);
  const [passwordRestoreInitialized, setPasswordRestoreInitialized] =
    useState(false);

  const handleInitializePasswordRestore = useCallback(async () => {
    try {
      setSpinner(true);

      await api.post("/admin/password-restore", {
        email: user.data.email,
      });

      notify("Ініацілізація пройшла успішно!", { type: "success" });

      setPasswordRestoreInitialized(true);
    } catch (error) {
      notify(`Відбулася помилка: ${(error as Error).message}`, {
        type: "error",
      });

      setPasswordRestoreInitialized(false);
    } finally {
      setSpinner(false);
    }
  }, [notify, user.data?.email]);

  const renderPasswordRestoreContent = useMemo(() => {
    if (passwordRestoreInitialized) {
      return (
        <p>
          На пошту користувача {user.data?.email} відправлено лист з силкою на
          зброс пароля
        </p>
      );
    }

    return (
      <Button
        size="large"
        onClick={handleInitializePasswordRestore}
        disabled={spinner}
      >
        {spinner ? <>Ініціалізація...</> : <>Ініціалізувати зброс пароля</>}
      </Button>
    );
  }, [
    handleInitializePasswordRestore,
    passwordRestoreInitialized,
    spinner,
    user.data?.email,
  ]);

  return (
    <Edit>
      <UsersForm passwordComponent={renderPasswordRestoreContent} />
    </Edit>
  );
};
