import {
  TextField,
  Show,
  SimpleShowLayout,
  DeleteButton,
  ImageField,
  TopToolbar,
  EditButton,
} from "react-admin";

export const UsersShow = () => {
  return (
    <Show
      actions={
        <TopToolbar>
          <EditButton />
          <DeleteButton />
        </TopToolbar>
      }
    >
      <SimpleShowLayout>
        <ImageField source="image.src" title="image.title" />
        <TextField source="name" />
        <TextField source="email" />
        <TextField source="role" />
      </SimpleShowLayout>
    </Show>
  );
};
