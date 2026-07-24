import React, { useMemo } from "react";
import SheetViewer from "./SheetViewer";
import { UrlMap, resolveNamespaceByCdFty } from "@utils/googleSheets";
import { useSelector } from "react-redux";
import type { RootState } from "@redux/store";

// ── VINA
const VINA_DEFAULTS: UrlMap = {
  F1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRWMdUZILlSenrqYkCqm6eHYymaJttJJDdisnKpPbxzt8DZKLhJjSJbUMLwHzvGrvaD71qKT9wlpzjQ/pubhtml",
  F2: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRVqYLI-RiI55S5CF0Pyt4MCLWB27Rd3u_qrvgFaYq4UAhKGy36BhQZ7zKonwYzdnCwtCZ1yJvD_Z9v/pubhtml",
  F5: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQVkgHVUo9XkfMdsKRVkuT7_2fnt8FPW-ZIcXbXECPll5Pek-mcHvTecVjwyIngIOZs6LzeTtdmvnnE/pubhtml",
};
const VINA_EDIT: UrlMap = {
  F1: "https://docs.google.com/spreadsheets/d/1P6awOGlfM4ejWxa3d1r3Ii8o7GkbBMjNIo1gSUc67HM/edit?gid=0#gid=0",
  F2: "https://docs.google.com/spreadsheets/d/19f5Qp2jEdsIro60mvWY-k2SVWDE5Vghtt6ca9OAiffU/edit?gid=0#gid=0",
  F5: "https://docs.google.com/spreadsheets/d/1uqltAn2PrcamvErOXgunuwHqNdQAv3ZXmhzD5SyOHP0/edit?gid=0#gid=0",
};

// ── PKTT
const PKTT_DEFAULTS: UrlMap = {
  F1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTpzzoSmtSxIoLIQxC3LGQsqvw8gE9QPfIghC7k41-QbUOMutcW_O93U5MYJSYrOYEjgM796RWSX0wO/pubhtml",
  F2: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXmokwhztmBphppozpbeA5lGfA5ckmkzb4uPtQQLRe6QWt_p7MHYTJ2T4IoAwKcth0vxA8VsunhQjq/pubhtml",
  F7: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtqO8wnGI0PiITGx0dhDwYpS6DakEZI7kT8OnecTxf40mGGrerh_x0E7PSJJsjWNs65DgRjDI9LeXW/pubhtml",
  F9: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAFacRgm1hLtSTzHg4gQQsMUvhc9g7c5vN4Qn2VTR4quBUdqmXhUH1iJFI-ZPTbYqRlMJXqCff_QAk/pubhtml",
  F10: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGqHz-9AjcLYia-4AkXhnyBecuJrmF-WqjM0_ihIfIL8a6zDlKGSeRtfyiKsrdcweOEHxOborODztz/pubhtml",
};
const PKTT_EDIT: UrlMap = {
  F1: "https://docs.google.com/spreadsheets/d/1k0asDonvi4eae35cBuU68aDj8FQEP15M8wVRCHV8iUY/edit?gid=0#gid=0",
  F2: "https://docs.google.com/spreadsheets/d/1LMkln5kOGyYD7FDtvIW1CYVWWvnegyGZEuhzV63JQ_g/edit?gid=0#gid=0",
  F7: "https://docs.google.com/spreadsheets/d/1Qw1kYwMojmlIErgol7ZskbRmG3VXwe7SL3EcytjsrNQ/edit?gid=0#gid=0",
  F9: "https://docs.google.com/spreadsheets/d/1dF6IGzVdpDq3Vws5NXBssXFMlXW0dJ-zi9I-YlEnreo/edit?gid=0#gid=0",
  F10: "https://docs.google.com/spreadsheets/d/1FSkjhR3ocowJOHaiI0GgNdWo4VTssb3VJ_miYZjy6wM/edit?gid=0#gid=0",
};

// ── BAGO
const BAGO_DEFAULTS: UrlMap = {
  F1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYAbcnVvbZ1BU3EQtHOaOAyRyfwghMTLF8WcFOWynjATEYEqHAqy9rb9ehaXMijcl8_BEiVjnJN68v/pubhtml",
  F2: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIhO2nNjtbNrSsIqgEzQzUcsjMC2Rgs5yOZYhw3hl_ggI7NfGT5HEn7S0fBJwqgJszNrrnI2DFw-qQ/pubhtml",
};
const BAGO_EDIT: UrlMap = {
  F1: "https://docs.google.com/spreadsheets/d/1UHKT9vBCTZmg3q6V9dgc44P0SKBsKaPWNS2a-esp9QE/edit?gid=0#gid=0",
  F2: "https://docs.google.com/spreadsheets/d/1MuhJapYoEZcJYa8rlG5V5LAMWsqlfOb4HWLGQNo4osc/edit?gid=0#gid=0",
};

const MAPS: Record<"vina" | "bago" | "pktt", { defaults: UrlMap; edits: UrlMap }> = {
  vina: { defaults: VINA_DEFAULTS, edits: VINA_EDIT },
  bago: { defaults: BAGO_DEFAULTS, edits: BAGO_EDIT },
  pktt: { defaults: PKTT_DEFAULTS, edits: PKTT_EDIT },
};

export default function GoogleSheets() {
  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));
  const cdFty = userEnvInfo?.cdFty;

  const ns = useMemo(() => resolveNamespaceByCdFty(cdFty) || "pktt", [cdFty]);
  const { defaults, edits } = MAPS[ns];

  return (
    <SheetViewer
      key={ns} // ns 바뀌면 컴포넌트 재마운트
      namespace={ns}
      defaultUrls={defaults}
      editUrls={edits}
    />
  );
}
