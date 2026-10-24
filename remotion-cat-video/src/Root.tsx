import "./index.css";
import { Composition, Folder } from "remotion";
import { CatVideo } from "./CatVideo";
import { IntroScene } from "./scenes/IntroScene";
import { CatScene } from "./scenes/CatScene";
import { OutroScene } from "./scenes/OutroScene";
import { FiveCatFacts } from "./FiveCatFacts";
import { calculateFiveCatFactsMetadata } from "./calculateFiveCatFactsMetadata";
import { FiveCatMyths } from "./FiveCatMyths";
import { calculateFiveCatMythsMetadata } from "./calculateFiveCatMythsMetadata";
import { FactsIntro } from "./facts/FactsIntro";
import { FactsOutro } from "./facts/FactsOutro";
import { FactScene } from "./facts/FactScene";
import { facts } from "./facts/factsData";
import { mythFacts } from "./facts/mythsData";
import { VOICEOVER_DIR as MYTHS_VOICEOVER_DIR } from "./facts/mythsNarration";
import { MotionLab } from "./reel/MotionLab";
import { TheCatCourt01 } from "./reel/TheCatCourt01";
import { TheCatCourt02, FILM02_FRAMES } from "./reel/TheCatCourt02";
import { TheCatCourt03, FILM03_FRAMES } from "./reel/readable/TheCatCourt03";
import { FPS, TOTAL_FRAMES } from "./reel/beats";
import { Rizz } from "./rizz/Rizz";
import {
  audioDurationMetadata,
  calculateRizzMetadata,
} from "./rizz/calculateRizzMetadata";
import { Explainer } from "./rizz/Explainer";
import { Tables } from "./rizz/Tables";
import { Sleep } from "./rizz/Sleep";
import { Purr } from "./rizz/Purr";
import { Talk } from "./rizz/Talk";

const FACT_DURATION = 135;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="CatVideo-Scenes">
        <Composition
          id="Intro"
          component={IntroScene}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Cat"
          component={CatScene}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Outro"
          component={OutroScene}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Composition
        id="CatVideo"
        component={CatVideo}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />

      <Folder name="FiveCatFacts-Scenes">
        <Composition
          id="FactsIntro"
          component={FactsIntro}
          durationInFrames={75}
          fps={30}
          width={1080}
          height={1920}
        />
        {facts.map((fact, i) => {
          const SingleFact: React.FC = () => (
            <FactScene
              fact={fact}
              index={i}
              total={facts.length}
              durationInFrames={FACT_DURATION}
            />
          );
          return (
            <Composition
              key={fact.number}
              id={`Fact-${fact.number}`}
              component={SingleFact}
              durationInFrames={FACT_DURATION}
              fps={30}
              width={1080}
              height={1920}
            />
          );
        })}
        <Composition
          id="FactsOutro"
          component={FactsOutro}
          durationInFrames={75}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Composition
        id="FiveCatFacts"
        component={FiveCatFacts}
        durationInFrames={735}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={calculateFiveCatFactsMetadata}
      />

      <Folder name="FiveCatMyths-Scenes">
        {mythFacts.map((fact, i) => {
          const SingleMythFact: React.FC = () => (
            <FactScene
              fact={fact}
              index={i}
              total={mythFacts.length}
              durationInFrames={FACT_DURATION}
              voiceoverDir={MYTHS_VOICEOVER_DIR}
            />
          );
          return (
            <Composition
              key={fact.number}
              id={`Myth-${fact.number}`}
              component={SingleMythFact}
              durationInFrames={FACT_DURATION}
              fps={30}
              width={1080}
              height={1920}
            />
          );
        })}
      </Folder>
      <Composition
        id="FiveCatMyths"
        component={FiveCatMyths}
        durationInFrames={735}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={calculateFiveCatMythsMetadata}
      />

      {/* Rizz — mascot short with per-word karaoke captions driven by whisper
          word timings. Duration comes from the voiceover. */}
      <Composition
        id="Rizz"
        component={Rizz}
        durationInFrames={430}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={calculateRizzMetadata}
      />

      {/* Footage shorts — stock cat clips, mascot overlay, meow stingers. */}
      <Folder name="Rizz-Footage">
        <Composition
          id="RizzSleep"
          component={Sleep}
          durationInFrames={505}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={audioDurationMetadata("sleep")}
        />
        <Composition
          id="RizzPurr"
          component={Purr}
          durationInFrames={615}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={audioDurationMetadata("purr")}
        />
        <Composition
          id="RizzTalk"
          component={Talk}
          durationInFrames={515}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={audioDurationMetadata("talk")}
        />
      </Folder>

      {/* "I ran a test" — Rizz on knocking things off tables. */}
      <Composition
        id="RizzTables"
        component={Tables}
        durationInFrames={560}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={audioDurationMetadata("tables")}
      />

      {/* Pipeline explainer — same mascot and karaoke layer, step strip
          anchored to the spoken keywords. */}
      <Composition
        id="RizzExplainer"
        component={Explainer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={audioDurationMetadata("explainer")}
      />

      <Composition
        id="MotionLab"
        component={MotionLab}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      <Composition
        id="TheCatCourt01"
        component={TheCatCourt01}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* Film 03 — the readable cut. Light editorial palette, 11 held moments, 60s.
          Rebuilt after Films 01/02 were rejected as too fast to read and too brown. */}
      <Composition
        id="TheCatCourt03"
        component={TheCatCourt03}
        durationInFrames={FILM03_FRAMES}
        fps={60}
        width={1080}
        height={1920}
      />

      {/* Film 02 — same picture at 75 BPM (0.625x) with narration. 35.2s. */}
      <Composition
        id="TheCatCourt02"
        component={TheCatCourt02}
        durationInFrames={FILM02_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
