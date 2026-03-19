import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router";
import { LuMenu } from "react-icons/lu";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

export default function PgLayout() {
  return (
    <Flex flex="1" direction="column" bg="bg">
      <PgHeroHeader />

      <Stack as="main" flex="1" alignItems="stretch">
        <Container pb="gap.xl" px={{ base: "gap.sm", md: "6" }}>
          <Outlet />
        </Container>
      </Stack>
    </Flex>
  );
}

function PgHeroHeader() {
  return (
    <Box as="header" bg="brand.green" minH={{ base: "325px", md: "600px" }}>
      <PgNav />
      <Container
        px={{ base: "gap.sm", md: "88px" }}
        py={{ base: "30px", md: "56px" }}
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

const NAV_LINKS = [
  { label: "Career Guide", href: "https://probablygood.org/career-guide/" },
  { label: "Career Profiles", href: "https://probablygood.org/career-profiles/" },
  { label: "Job Board", href: "https://jobs.probablygood.org/" },
  { label: "Explore", href: "https://probablygood.org/explore/" },
  { label: "Advising", href: "https://probablygood.org/advising/" },
  { label: "About", href: "https://probablygood.org/about/" },
] as const;

function PgNav() {
  const state = useStateValtio({ isMenuOpen: false });

  function toggleMenu() {
    state.mutable.isMenuOpen = !state.mutable.isMenuOpen;
  }

  const isMenuOpen = state.snap.isMenuOpen;

  return (
    <Box position="relative">
      <Container
        px={{ base: "gap.sm", md: "38px" }}
        pt={{ base: "gap.sm", md: "gap.md" }}
        pb={{ md: "gap.md" }}
      >
        <HStack justify="space-between" align="center">
          <NavLink to="/">
            <Image src="/ProbablyGoodLogo.svg" alt="Probably Good" w="121px" h="60px" />
          </NavLink>

          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Menu"
            variant="ghost"
            color="white"
            _icon={{ w: "35px", h: "35px" }}
            onClick={toggleMenu}
          >
            <LuMenu />
          </IconButton>

          <HStack as="nav" gap="9" display={{ base: "none", md: "flex" }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                fontWeight="medium"
                fontSize="sm"
                letterSpacing="0.5px"
                color="white"
                _hover={{ textDecoration: "underline", textDecorationColor: "white" }}
              >
                {link.label}
              </Link>
            ))}
          </HStack>
        </HStack>
      </Container>

      <Box
        display={{ md: "none" }}
        position="absolute"
        left="0"
        right="0"
        bg="brand.seashell"
        px="gap.sm"
        py="2"
        zIndex="10"
        opacity={isMenuOpen ? 1 : 0}
        transform={isMenuOpen ? "translateY(0)" : "translateY(-8px)"}
        pointerEvents={isMenuOpen ? "auto" : "none"}
        transition="opacity 0.2s ease, transform 0.2s ease"
      >
        {NAV_LINKS.map(link => (
          <Link
            key={link.label}
            href={link.href}
            display="block"
            fontWeight="medium"
            fontSize="sm"
            letterSpacing="0.5px"
            color="brand.black"
            py="3"
            _hover={{ textDecoration: "underline", textDecorationColor: "brand.black" }}
          >
            {link.label}
          </Link>
        ))}
      </Box>
    </Box>
  );
}
