"use client";

import { Avatar } from "@/components/ui/avatar";
import type { FileUploadRootProps } from "@/components/ui/file-button";
import { FileUploadRoot, FileUploadTrigger } from "@/components/ui/file-button";
import { Button, Stack, Text, useEnvironmentContext } from "@chakra-ui/react";
import { useState } from "react";

interface PhotoUploadProps extends FileUploadRootProps {
  src?: string;
}

export const AvatarUpload = (props: PhotoUploadProps) => {
  const { src: srcProp, ...rest } = props;
  const [src, setSrc] = useState<string | undefined>(srcProp);
  const env = useEnvironmentContext();
  return (
    <FileUploadRoot
      accept="image/*"
      maxFileSize={3145728}
      flexDirection="row"
      alignItems="flex-end"
      onFileChange={e => {
        const win = env.getWindow();
        const reader = new win.FileReader();
        reader.onload = () => setSrc(reader.result as string);
        reader.readAsDataURL(e.acceptedFiles[0]);
      }}
      {...rest}
    >
      <Avatar size="2xl" src={src} />
      <Stack>
        <FileUploadTrigger asChild>
          <Button size="xs" variant="subtle" colorPalette="gray">
            Upload avatar
          </Button>
        </FileUploadTrigger>
        <Text color="fg.muted" textStyle="sm">
          Pick an image up to 3MB
        </Text>
      </Stack>
    </FileUploadRoot>
  );
};
