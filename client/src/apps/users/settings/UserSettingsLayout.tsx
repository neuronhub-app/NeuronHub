import { For, Tabs } from "@chakra-ui/react";
import { FaBell, FaUser, FaUsers } from "react-icons/fa";
import { NavLink, Outlet, useLocation } from "react-router";
import { urls } from "@/urls";

export default function UserSettingsLayout() {
  const { pathname } = useLocation();

  const tabs = [
    {
      label: "Profile",
      value: urls.user.settings.profile,
      icon: <FaUser />,
    },
    {
      label: "Connections",
      value: urls.user.settings.connections,
      icon: <FaUsers />,
    },
    {
      label: "Notifications",
      value: urls.user.settings.notifications,
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
          <Tabs.Content value={tab.value} key={tab.value} p={0}>
            {<Outlet />}
          </Tabs.Content>
        )}
      </For>
    </Tabs.Root>
  );
}
