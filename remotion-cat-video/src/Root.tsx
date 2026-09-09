import "./index.css";
import { Composition, Folder } from "remotion";
import { CatVideo } from "./CatVideo";
import { IntroScene } from "./scenes/IntroScene";
import { CatScene } from "./scenes/CatScene";
import { OutroScene } from "./scenes/OutroScene";
import { FiveCatFacts } from "./FiveCatFacts";
import { calculateFiveCatFactsMetadata } from "./calculateFiveCatFactsMetadata";
import { FactsIntro } from "./facts/FactsIntro";
import { FactsOutro } from "./facts/FactsOutro";
import { FactScene } from "./facts/FactScene";
import { facts } from "./facts/factsData";

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
    </>
  );
};
