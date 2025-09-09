import { Box, Button, Image, Stack, Text, useEnvironmentContext } from "@chakra-ui/react";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { LuUpload, LuX } from "react-icons/lu";
import type { schemas } from "@/components/posts/form/schemas";
import { FileUploadRoot, FileUploadTrigger } from "@/components/ui/file-button";

// #AI
export function ImageUpload(props: {
  name: "image";
  control: Control<schemas.Tool>;
  label: string;
  inputProps?: { "data-testid": string };
}) {
  const env = useEnvironmentContext();

  const [preview, setPreview] = useState<string | null>(null);

  return (
    <Controller
      name={props.name}
      control={props.control}
      render={control => (
        <Stack w="full" gap="gap.sm">
          <Text fontSize="sm" fontWeight="semibold">
            {props.label}
          </Text>

          {preview && (
            <Box position="relative" maxW="200px">
              <Image src={preview} borderRadius="md" alt="Preview" />
              <Button
                aria-label="Remove"
                onClick={() => {
                  setPreview(null);
                  control.field.onChange(null);
                }}
                variant="solid"
                size="xs"
                position="absolute"
                colorPalette="red"
                top="gap.sm"
                right="gap.sm"
              >
                <LuX />
              </Button>
            </Box>
          )}

          <FileUploadRoot
            accept="image/*"
            maxFileSize={5242880} // 5MB
            onFileChange={e => {
              // #AI
              const file = e.acceptedFiles[0];
              if (file) {
                const window = env.getWindow();
                const reader = new window.FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
                control.field.onChange(file);
              }
            }}
            // @ts-expect-error #bad-infer
            inputProps={props.inputProps}
            gap="gap.sm"
          >
            <FileUploadTrigger asChild>
              <Button size="sm" variant="outline">
                <LuUpload />
                Upload
              </Button>
            </FileUploadTrigger>
            <Text color="fg.subtle" fontSize="xs">
              Max 5 MB
            </Text>
          </FileUploadRoot>
        </Stack>
      )}
    />
  );
}
