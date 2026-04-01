import { toaster } from "@/components/ui/toaster";
import { env } from "@/env";
import { Box, chakra, IconButton, Menu, Float, Portal } from "@chakra-ui/react";

import { admin } from "@neuronhub/shared/admin-urls";
import { icons } from "@neuronhub/shared/theme/icons";

import { useAuth } from "@/apps/users/useUserCurrent";
import { ColorModeIcon, useColorMode } from "@/components/ui/color-mode";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { useEffect } from "react";

export function AdminMenuFloatButton(props: { isThemeSwitcher?: boolean }) {
  const mode = useColorMode();
  const auth = useAuth();

  const storageKey = "is_admin_menu_hidden";

  const state = useStateValtio({
    isHidden: localStorage.getItem(storageKey) ?? false,
  });

  useEffect(() => {
    if (state.mutable.isHidden) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, "true");
    }
  }, [state.snap]);

  if (!(auth.user?.is_superuser || auth.user?.is_staff)) {
    return null;
  }

  if (state.snap.isHidden) {
    return null;
  }

  return (
    <Float placement="bottom-start" offset={["6", null, "9"]} pos="sticky">
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton variant="ghost" aria-label="Admin Menu" focusRing="none">
            <icons.settings />
          </IconButton>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.ItemGroup>
                <Menu.Item
                  value="hide"
                  onClick={() => {
                    state.mutable.isHidden = true;
                    toaster.info({
                      title: "Admin menu hidden",
                      description: `Restore by removing Local Storage "${storageKey}"`,
                      action: {
                        label: "Undo",
                        onClick: () => {
                          state.mutable.isHidden = false;
                        },
                      },
                      duration: 3_000,
                      closable: true,
                    });
                  }}
                >
                  <icons.hide />
                  <Box>Hide</Box>
                </Menu.Item>

                {props.isThemeSwitcher &&
                  (env.isTiredOwlDev || auth.user?.email.includes("neuronhub.app")) && (
                    <Menu.Item
                      value="toggle theme"
                      closeOnSelect={false}
                      onClick={mode.toggleColorMode}
                    >
                      <ColorModeIcon />
                      <Box>Color Mode</Box>
                    </Menu.Item>
                  )}
              </Menu.ItemGroup>

              <Menu.Root positioning={{ placement: "left-end", gutter: 0 }}>
                <Menu.TriggerItem>
                  <icons.admin />
                  Admin
                  <icons.chevron_right />
                </Menu.TriggerItem>

                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item value="users" asChild>
                        <LinkExt href={admin.urls.users}>
                          <icons.users />
                          <Box>Users</Box>
                        </LinkExt>
                      </Menu.Item>

                      <Menu.Item value="tags" asChild>
                        <LinkExt href={admin.urls.tags}>
                          <icons.tags />
                          <Box>Tags</Box>
                        </LinkExt>
                      </Menu.Item>

                      <Menu.Item value="jobs" asChild>
                        <LinkExt href={admin.urls.jobs}>
                          <icons.job />
                          <Box>Jobs</Box>
                        </LinkExt>
                      </Menu.Item>

                      <Menu.Item value="job_alerts" asChild>
                        <LinkExt href={admin.urls.job_alerts}>
                          <icons.job_alert />
                          <Box>Job Alerts</Box>
                        </LinkExt>
                      </Menu.Item>

                      <Menu.Item value="site_config" asChild>
                        <LinkExt href={admin.urls.site_config}>
                          <icons.site_config />
                          <Box>Site Config</Box>
                        </LinkExt>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>

              <Menu.ItemGroup>
                <Menu.Item value="docs" asChild>
                  <LinkExt href="https://docs.neuronhub.app">
                    <icons.docs />
                    <Box>Docs</Box>
                  </LinkExt>
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Float>
  );
}

const LinkExt = chakra(
  "a",
  {
    base: {
      textDecoration: "none",
      _hover: {
        cursor: "pointer",
      },
    },
  },
  {
    defaultProps: { target: "_blank" },
  },
);
