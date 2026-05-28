import { TImageValidation } from "../types/validation";

const getImageExtensionValidationResult = (img: TImageValidation) => {
  const allowedExtensions = /^image\/(png|jpe?g|webp)$/;

  if (img.url || img.src || !img.rawFile) {
    return;
  }

  if (!allowedExtensions.test(img.rawFile.type)) {
    return `Недопустимий формат ${
      img.rawFile.type.split("/")[1]
    }! Допускається тільки jpeg, jpg, png і webp`;
  }
};

export const allowedImageExtension = () => (img?: TImageValidation) => {
  if (!img) {
    return;
  }
  return getImageExtensionValidationResult(img);
};

export const allowedImageExtensions = () => (imgs?: TImageValidation[]) => {
  if (!imgs) {
    return;
  }
  for (const img of imgs) {
    return getImageExtensionValidationResult(img);
  }
};
