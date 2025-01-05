"use client";

import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { toaster } from "@/components/ui/toaster";
import { IconButton, Span } from "@chakra-ui/react";
import { useState } from "react";
import { LuMessageCircleMore, LuRefreshCcw, LuX } from "react-icons/lu";

export const MemberActions = (props: { item: string }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleResendInvite = () => {
    // do something
    toaster.success({ title: `The invite has been sent to ${props.item}` });
  };

  const handleBeforeRevoke = () => {
    setShowConfirmDialog(true);
  };

  const handleRevoke = () => {
    // do something
    setShowConfirmDialog(false);
    toaster.success({ title: "Member revoked" });
  };

  return (
    <>
      <MenuRoot
        onSelect={e => {
          const actionMap: Record<string, VoidFunction> = {
            "resend-invite": handleResendInvite,
            revoke: handleBeforeRevoke,
          };
          actionMap[e.value]?.();
        }}
      >
        <MenuTrigger asChild>
          <IconButton variant="ghost" size="2xs">
            <LuMessageCircleMore />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="resend-invite">
            <LuRefreshCcw /> Resend invite
          </MenuItem>
          <MenuItem value="revoke" color="fg.error">
            <LuX /> Revoke access
          </MenuItem>
        </MenuContent>
      </MenuRoot>

      <DialogRoot
        size="xs"
        role="alertdialog"
        open={showConfirmDialog}
        onOpenChange={() => setShowConfirmDialog(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <Span fontWeight="medium" color="fg">
                {props.item}
              </Span>{" "}
              from the team?
            </DialogDescription>
          </DialogBody>
          <DialogFooter>
            <Button onClick={handleRevoke} flex="1">
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};
