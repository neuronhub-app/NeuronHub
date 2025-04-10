import { urls } from "@/urls";
import { For, Tabs } from "@chakra-ui/react";
import { FaUsers } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { NavLink, Outlet, useLocation } from "react-router";

export default function UserSettingsLayout() {
  const { pathname } = useLocation();

  const tabs = [
    {
      label: "Profile",
      value: urls.user.settings.profile.path,
      icon: <FaUser />,
    },
    {
      label: "Connections",
      value: urls.user.settings.connections.path,
      icon: <FaUsers />,
    },
    {
      label: "Notifications",
      value: urls.user.settings.notifications.path,
      icon: <FaBell />,
    },
  ];

  return (
    <Tabs.Root value={pathname} size="lg">
      <Tabs.List>
        <For each={tabs}>
          {tab => (
            <NavLink to={tab.value} key={tab.value}>
              <Tabs.Trigger value={tab.value}>
                {tab.icon}
                {tab.label}
              </Tabs.Trigger>
            </NavLink>
          )}
        </For>
      </Tabs.List>

      <For each={tabs}>
        {tab => (
          <Tabs.Content value={tab.value} p={0}>
            {<Outlet />}
          </Tabs.Content>
        )}
      </For>
    </Tabs.Root>
  );
}
