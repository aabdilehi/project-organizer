import { useControllableState } from "@chakra-ui/react";
import React from "react";

export function useCustomEditableState(props) {
  const {
    value: valueProp,
    onChange,
    isDisabled,
    isReadOnly,
    defaultValue,
  } = props;

  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue || "",
    onChange,
  });

  const [isEditing, setIsEditing] = React.useState(false);

  const isInteractive = !(isDisabled || isReadOnly);

  const isControlled = valueProp !== undefined;

  const startEdit = React.useCallback(() => {
    if (isInteractive) {
      setIsEditing(true);
    }
  }, [isInteractive]);

  const cancelEdit = React.useCallback(() => {
    if (!isControlled) {
      setValue(defaultValue || "");
    }
    setIsEditing(false);
  }, [defaultValue, isControlled, setValue]);

  const submitEdit = React.useCallback(() => {
    setIsEditing(false);
  }, []);

  const onChangeProp = React.useCallback(
    (value) => {
      if (!isControlled) {
        setValue(value);
      }
    },
    [isControlled, setValue]
  );

  return {
    isEditing,
    isDisabled,
    isReadOnly,
    isInteractive,
    value,
    onChange: onChangeProp,
    onCancel: cancelEdit,
    onSubmit: submitEdit,
    onEdit: startEdit,
  };
}
