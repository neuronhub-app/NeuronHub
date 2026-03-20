import {
  Flex,
  FormatNumber,
  Icon,
  Link,
  NumberInput,
  Slider,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { PiInfoFill } from "react-icons/pi";
import { proxy, useSnapshot } from "valtio";
import { useRange } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { format } from "@neuronhub/shared/utils/format";

const textStyle = { ...facetStyle.value, color: "fg" } as const;

const salaryFormatOptions = {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
} as const;

export const salaryFormatter = new Intl.NumberFormat("en-US", salaryFormatOptions);

export const salaryFilterState = proxy({
  excludeNoSalary: false,
  showInfo: false,
});

function SalaryExtras(props: { isSalarySelected: boolean }) {
  const snap = useSnapshot(salaryFilterState);

  return (
    <>
      <Switch.Root
        checked={snap.excludeNoSalary}
        disabled={props.isSalarySelected}
        onCheckedChange={() => {
          salaryFilterState.excludeNoSalary = !salaryFilterState.excludeNoSalary;
        }}
        w="full"
      >
        <Switch.HiddenInput />
        <Flex w="full" justify="space-between" align="center" gap="gap.md">
          <Switch.Label {...textStyle}>Exclude roles without salary info</Switch.Label>
          <Switch.Control bg="brand.green.subtle" _checked={{ bg: "brand.green.light" }}>
            <Switch.Thumb />
          </Switch.Control>
        </Flex>
      </Switch.Root>

      <Flex
        align="center"
        gap="gap.xs"
        onClick={() => {
          salaryFilterState.showInfo = !salaryFilterState.showInfo;
        }}
        cursor="pointer"
      >
        <Text {...textStyle}>How is this calculated?</Text>
        <Icon color="brand.green.light" boxSize="4">
          <PiInfoFill />
        </Icon>
      </Flex>
      {snap.showInfo && (
        <Stack {...textStyle} gap="0">
          <Text>• Hourly, weekly or monthly salaries are annualised.</Text>
          <Text>
            • Excluding roles without salary information also excludes one-off payment schemes
            such as grants and awards.
          </Text>
          <Text>
            • Non-US salaries are converted to their USD equivalent using{" "}
            <Link href="https://fxratesapi.com" target="_blank" color="brand.green.light">
              FXRatesAPI.
            </Link>
          </Text>
        </Stack>
      )}
    </>
  );
}

export function resetSalaryFilter() {
  salaryFilterState.excludeNoSalary = false;
}

export function PgFacetSalary() {
  const range = useRange({ attribute: "salary_min" });

  if (!range.range.min || !range.range.max) {
    return null;
  }

  const valueStart = range.start[0];
  const slider = { step: 1000, min: range.range.min, max: range.range.max };

  function refine(value: number) {
    if (value <= slider.min) {
      range.refine([slider.min, slider.max]);
    } else {
      const valueRounded = Math.round(value / slider.step) * slider.step;
      range.refine([Math.min(valueRounded, slider.max), slider.max]);
    }
  }

  const isActive = valueStart != null && Number.isFinite(valueStart) && valueStart > slider.min;
  const valueCurrent = isActive ? valueStart : slider.min;

  return (
    <Stack gap="gap.sm">
      <NumberInput.Root
        value={isActive ? String(valueCurrent) : ""}
        onValueChange={details => {
          if (Number.isFinite(details.valueAsNumber)) {
            refine(details.valueAsNumber);
          }
        }}
        size="xs"
        step={slider.step}
        max={slider.max}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      >
        <NumberInput.Input placeholder={`${format.money(slider.min)}+`} />
      </NumberInput.Root>

      <Slider.Root
        value={[valueCurrent, slider.max]}
        min={slider.min}
        max={slider.max}
        step={slider.step}
        onValueChange={details => refine(details.value[0])}
        thumbCollisionBehavior="push"
        size="sm"
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range bg="brand.green.light" />
          </Slider.Track>
          <Slider.Thumb index={0} borderColor="brand.green.light" />
        </Slider.Control>
      </Slider.Root>

      <Flex justify="space-between" color="fg.muted" fontSize="2xs">
        <Text>
          <FormatNumber value={slider.min} {...salaryFormatOptions} />
        </Text>
        <Text>
          <FormatNumber value={slider.max} {...salaryFormatOptions} />
        </Text>
      </Flex>

      <SalaryExtras isSalarySelected={isActive} />
    </Stack>
  );
}
