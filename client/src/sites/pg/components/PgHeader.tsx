import {
  Box,
  Collapsible,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  HoverCard,
  Portal,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { LuChevronDown, LuMenu, LuX } from "react-icons/lu";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { layout } from "@/sites/pg/PgLayout";

const style = {
  nav: {
    px: { base: "30px", md: "10" },
    py: "5",
  },
  hero: {
    pl: layout.style.header.paddingX,
    pr: { base: "30px", md: layout.style.header.paddingX.md },
  },
  logo: { w: "140px", h: "70px" },
  navLink: {
    fontWeight: "500",
    fontSize: "17px",
    lineHeight: "60px",
    px: "5",
    color: "brand.seashell",
    _hover: { textDecoration: "underline", textDecorationColor: "brand.seashell" },
  },
  dropdown: {
    container: {
      p: "0.8em",
      borderRadius: "8px",
      borderWidth: "1px",
      borderColor: "brand.gray.warm",
      boxShadow: "none",
      bg: "brand.seashell",
    },
    link: {
      display: "block",
      fontSize: "15px",
      lineHeight: "1.6",
      py: "2.5",
      px: "5",
      fontWeight: "500",
      color: "brand.black",
      _hover: {
        bg: "brand.hover.background",
        textDecoration: "underline",
        textDecorationColor: "brand.hover.underline",
      },
    },
  },
  mobile: {
    topLink: {
      borderWidth: "1px",
      borderColor: "brand.beige",
      px: "5",
      lineHeight: "60px",
      fontWeight: "500",
      fontSize: "17px",
      letterSpacing: "0.2px",
      color: "brand.black",
    },
    childLink: {
      display: "block",
      fontSize: "15px",
      lineHeight: "1.6",
      py: "2.5",
      px: "5",
      fontWeight: "500",
      color: "brand.black",
      border: "1px solid",
      borderColor: "brand.beige",
    },
  },
} as const;

export type NavLinkChild = { id: string; label: string; href: string };
export type NavLink = { id: string; label: string; href: string; links: NavLinkChild[] };

export function PgHeroHeader(props: { navLinks: NavLink[]; isLoading: boolean }) {
  return (
    <Box as="header" bg="brand.green">
      <PgNav navLinks={props.navLinks} isLoading={props.isLoading} />

      <Container
        {...style.hero}
        pt={{ base: "30px", md: "14" }}
        pb={layout.style.header.paddingBottom}
        color="brand.seashell"
        fontWeight="medium"
      >
        <Text
          as="h1"
          fontFamily="heading"
          fontSize={{ base: "26px", md: "6xl" }}
          lineHeight={{ base: "32px", md: "1.2" }}
        >
          Find a job that&apos;s good,
          <br />
          for you{" "}
          <Box
            as="span"
            fontFamily="heading"
            fontStyle="italic"
            fontSize={{ base: "26px", md: "6xl" }}
            lineHeight={{ base: "32px", md: "1.2" }}
          >
            and
          </Box>{" "}
          for the world.
        </Text>
        <Text
          fontSize={{ base: "19px", md: "23px" }}
          lineHeight={{ base: "25px", md: "1.4" }}
          mt={{ base: "4", md: "12" }}
        >
          Curated high-impact jobs for people who want to make a difference.
        </Text>
      </Container>
    </Box>
  );
}

function PgNav(props: { navLinks: NavLink[]; isLoading: boolean }) {
  const state = useStateValtio({ isMenuOpen: false });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.snap.isMenuOpen) {
      return;
    }
    function handler(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        state.mutable.isMenuOpen = false;
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [state.snap.isMenuOpen]);

  return (
    <Box position="relative" ref={menuRef}>
      <Container {...style.nav}>
        <HStack justify="space-between" align="center" maxH={{ base: "110px", md: "unset" }}>
          <Link href="https://probablygood.org/">
            <Image src="/ProbablyGoodLogo.svg" alt="Probably Good" {...style.logo} />
          </Link>

          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Menu"
            variant="ghost"
            color="white"
            w="57px"
            h="60px"
            onClick={() => {
              state.mutable.isMenuOpen = !state.mutable.isMenuOpen;
            }}
          >
            <Icon boxSize="22px">{state.snap.isMenuOpen ? <LuX /> : <LuMenu />}</Icon>
          </IconButton>

          <HStack as="nav" gap="0" display={{ base: "none", md: "flex" }}>
            {props.isLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} height="20px" width="80px" mx="5" />
                ))
              : props.navLinks.map(link =>
                  link.links.length > 0 ? (
                    <PgNavDropdown key={link.label} link={link} />
                  ) : (
                    <PgNavLink key={link.label} label={link.label} href={link.href} />
                  ),
                )}
          </HStack>
        </HStack>
      </Container>

      <PgMobileMenu isOpen={state.snap.isMenuOpen} navLinks={props.navLinks} />
    </Box>
  );
}

function PgNavLink(props: { label: string; href: string }) {
  return (
    <Link href={props.href} {...style.navLink}>
      {props.label}
    </Link>
  );
}

function PgNavDropdown(props: { link: NavLink }) {
  return (
    <HoverCard.Root
      openDelay={0}
      closeDelay={100}
      positioning={{ placement: "bottom-start", offset: { mainAxis: 0 } }}
    >
      <HoverCard.Trigger asChild>
        <Link href={props.link.href} {...style.navLink}>
          {props.link.label}
        </Link>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content {...style.dropdown.container}>
            {props.link.links.map(child => (
              <Link key={child.label} href={child.href} {...style.dropdown.link}>
                {child.label}
              </Link>
            ))}
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  );
}

function PgMobileMenu(props: { isOpen: boolean; navLinks: NavLink[] }) {
  const state = useStateValtio({ openSection: "" });

  return (
    <Box
      display={{ md: "none" }}
      position="absolute"
      left={"30px"}
      right={"30px"}
      bg="brand.seashell"
      borderRadius="8px"
      zIndex="10"
      opacity={props.isOpen ? 1 : 0}
      transform={props.isOpen ? "translateY(0)" : "translateY(-8px)"}
      pointerEvents={props.isOpen ? "auto" : "none"}
      transition="opacity 0.2s ease, transform 0.2s ease"
      overflow="hidden"
      border="1px solid {colors.brand.black}"
    >
      {props.navLinks.map(link =>
        link.links.length > 0 ? (
          <PgMobileCollapsibleSection
            key={link.label}
            link={link}
            isOpen={state.snap.openSection === link.label}
            onToggle={() => {
              state.mutable.openSection =
                state.mutable.openSection === link.label ? "" : link.label;
            }}
          />
        ) : (
          <PgMobileLink key={link.label} label={link.label} href={link.href} />
        ),
      )}
    </Box>
  );
}

function PgMobileLink(props: { label: string; href: string }) {
  return (
    <Link href={props.href} {...style.mobile.topLink} display="block">
      {props.label}
    </Link>
  );
}

function PgMobileCollapsibleSection(props: {
  link: NavLink;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Collapsible.Root open={props.isOpen} onOpenChange={props.onToggle}>
      <Collapsible.Trigger asChild>
        <Flex
          justify="space-between"
          align="center"
          cursor="pointer"
          {...style.mobile.topLink}
          pr="0"
          bg={props.isOpen ? "brand.hover.background" : "transparent"}
        >
          <Text
            textDecoration={props.isOpen ? "underline" : "none"}
            textDecorationColor={props.isOpen ? "brand.hover.underline" : "transparent"}
          >
            {props.link.label}
          </Text>
          <Flex
            align="center"
            justify="center"
            w="57px"
            h="60px"
            transform={props.isOpen ? "rotate(180deg)" : "rotate(0deg)"}
            transition="transform 0.2s ease"
          >
            <Icon boxSize="17px">
              <LuChevronDown />
            </Icon>
          </Flex>
        </Flex>
      </Collapsible.Trigger>

      <Collapsible.Content borderColor="black">
        <Stack gap="0">
          {props.link.links.map(child => (
            <Link key={child.label} href={child.href} {...style.mobile.childLink}>
              {child.label}
            </Link>
          ))}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
