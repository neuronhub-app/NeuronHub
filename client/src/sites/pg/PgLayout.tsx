import {
  type StackProps,
  Box,
  Container,
  Flex,
  Grid,
  HStack,
  Icon,
  Link,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Outlet } from "react-router";
import { SlEnvolope } from "react-icons/sl";
import {
  FaLinkedin,
  FaGithub,
  FaYoutube,
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
  FaMastodon,
} from "react-icons/fa";
import { SiMatrix, SiSubstack } from "react-icons/si";
import { FooterLinkIcon, FooterSectionKind } from "~/graphql/enums";
import { useSnapshot } from "valtio";
import { siteConfigState, type FooterSection } from "@/sites/pg/siteConfigState";
import { PgHeroHeader } from "@/sites/pg/components/PgHeader";
import { layout } from "@/sites/pg/PgLayoutConfig";

const style = layout.style.container;

export default function PgLayout() {
  const configSnap = useSnapshot(siteConfigState);

  const footer = useFooterSections(configSnap.data?.footer_sections);

  return (
    <Flex flex="1" direction="column" bg="bg">
      <PgHeroHeader
        navLinks={configSnap.data?.nav_links ?? []}
        isLoading={configSnap.isLoading}
      />

      <Stack as="main" flex="1" alignItems="stretch" overflow="hidden" pb={style.paddingBottom}>
        <Container px={style.paddingX}>
          <Outlet />
        </Container>
      </Stack>

      <PgFooter footer={footer} isLoading={configSnap.isLoading} />
    </Flex>
  );
}

function PgFooter(props: { footer: FooterData; isLoading: boolean }) {
  const footerLinkStyle = {
    color: "brand.beige",
    _hover: { textDecoration: "underline" },
  } as const;

  return (
    <Box as="footer" bg="brand.footer.bg" color="brand.seashell" minH={{ md: "450px" }}>
      <Container
        pl={style.paddingX.base}
        pr={{ base: style.paddingX.base, md: "gap.lg" }}
        pt={{ base: "22px", md: style.paddingBottom.base }}
      >
        <Grid
          templateColumns={{
            base: "1fr",
            md: `2fr${" 1fr".repeat(props.footer.columns.length)}`,
          }}
          gap={{ base: style.paddingX.base, md: "30px" }}
        >
          <FooterDescription
            isLoading={props.isLoading}
            socialLinks={props.footer.socialLinks}
          />

          {props.footer.columns.map((section, index) => (
            <FooterSectionColumn
              key={section.id}
              title={section.title}
              links={section.links}
              isLoading={props.isLoading}
              chakra={{ mt: { base: index === 0 ? "1.5" : "0", md: "0" } }}
            />
          ))}
        </Grid>
      </Container>

      <Container px="0">
        <Separator
          mt={{ base: "5", md: "14" }}
          mb={{ base: "5", md: "0" }}
          mx={{ base: style.paddingX.base, md: layout.style.header.paddingX.base }}
          borderColor="brand.seashell"
        />

        <HStack
          justify="center"
          flexWrap="wrap"
          columnGap={{ base: "gap.xs", md: "1" }}
          rowGap={{ base: "0.5", md: "1" }}
          h={{ base: "70px", md: "55px" }}
          px={{ base: style.paddingX.base, md: layout.style.header.paddingX.base }}
          pb={{ base: "22px", md: "0" }}
          color="brand.beige"
          fontSize="sm"
        >
          <HStack gap="1">
            <Text>© {new Date().getFullYear()} </Text>
            <Link href="https://probablygood.org/about/" {...footerLinkStyle}>
              Probably Good
            </Link>
            <Text>|</Text>
          </HStack>
          {props.footer.bottomLinks.map((link, index) => (
            <HStack key={link.label} gap="1">
              <Link href={link.href} {...footerLinkStyle}>
                {link.label}
              </Link>
              {index < props.footer.bottomLinks.length - 1 && <Text>|</Text>}
            </HStack>
          ))}
        </HStack>
      </Container>
    </Box>
  );
}

function FooterDescription(props: { socialLinks: FooterSection["links"]; isLoading: boolean }) {
  const icons = {
    [FooterLinkIcon.Email]: <SlEnvolope />,
    [FooterLinkIcon.Linkedin]: <FaLinkedin />,
    [FooterLinkIcon.Github]: <FaGithub />,
    [FooterLinkIcon.Youtube]: <FaYoutube />,
    [FooterLinkIcon.Twitter]: <FaTwitter />,
    [FooterLinkIcon.Facebook]: <FaFacebookF />,
    [FooterLinkIcon.Instagram]: <FaInstagram />,
    [FooterLinkIcon.Discord]: <FaDiscord />,
    [FooterLinkIcon.Mastodon]: <FaMastodon />,
    [FooterLinkIcon.Matrix]: <SiMatrix />,
    [FooterLinkIcon.Substack]: <SiSubstack />,
  } as const;

  return (
    <Stack gap="3.5">
      <Text fontFamily="heading" fontWeight="medium" fontSize={{ base: "20px", md: "26px" }}>
        <Box as="span" fontStyle="italic">
          Probably Good
        </Box>{" "}
        is a nonprofit
        <br />
        that empowers people to do
        <br />
        good with their careers.
      </Text>

      <HStack gap="3.5">
        {props.isLoading
          ? [1, 2].map(index => (
              <Skeleton key={index} width="8" height="8" borderRadius="full" />
            ))
          : props.socialLinks.map(link => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                transition="transform 0.2s"
                _hover={{ transform: "scale(1.1)" }}
              >
                <Flex
                  w="9"
                  h="9"
                  borderRadius="full"
                  bg="brand.black"
                  align="center"
                  justify="center"
                >
                  <Icon fontSize="lg" color="brand.seashell">
                    {icons[link.icon as FooterLinkIcon]}
                  </Icon>
                </Flex>
              </Link>
            ))}
      </HStack>
    </Stack>
  );
}

function FooterSectionColumn(props: {
  title: string;
  links: FooterSection["links"];
  isLoading: boolean;
  chakra?: StackProps;
}) {
  const style = {
    link: {
      fontWeight: "medium",
      fontSize: "md",
      lineHeight: "25.92px",
      color: "brand.seashell",
      _hover: { textDecoration: "underline" },
    },
  } as const;

  return (
    <Stack gap="gap.xs" {...props.chakra}>
      <Text
        fontFamily="heading"
        fontWeight="semibold"
        fontSize="19px"
        lineHeight="30.24px"
        color="brand.gray.warm"
      >
        {props.title}
      </Text>

      <Stack gap={{ base: "gap.xs", md: "3" }}>
        {props.isLoading
          ? [1, 2, 3].map(index => <Skeleton key={index} height="26px" width="120px" />)
          : props.links.map(link => (
              <Link key={link.label} href={link.href} {...style.link}>
                {link.label}
              </Link>
            ))}
      </Stack>
    </Stack>
  );
}

function useFooterSections(sections?: readonly FooterSection[]): FooterData {
  const sectionsByEnum = {} as Record<FooterSectionKind, FooterSection[]>;

  for (const enumValue of Object.values(FooterSectionKind)) {
    sectionsByEnum[enumValue] = [];
  }
  for (const section of sections ?? []) {
    sectionsByEnum[section.kind as FooterSectionKind]?.push(section);
  }
  return {
    columns: sectionsByEnum[FooterSectionKind.Column],
    socialLinks: sectionsByEnum[FooterSectionKind.Social]?.[0]?.links ?? [],
    bottomLinks: sectionsByEnum[FooterSectionKind.Bottom]?.[0]?.links ?? [],
  };
}

type FooterData = {
  columns: FooterSection[];
  socialLinks: FooterSection["links"];
  bottomLinks: FooterSection["links"];
};
