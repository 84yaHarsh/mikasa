import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display";

function Live2DAvatar() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      view: canvasRef.current,
      autoStart: true,
      resizeTo: window,
      backgroundAlpha: 0,
    });

    let model;

    Live2DModel.from("/live2d/haru_girl/Haru.model3.json").then((m) => {
      model = m;

      app.stage.addChild(model);

      // center model
      model.x = window.innerWidth / 2;
      model.y = window.innerHeight * 0.9;

      model.scale.set(0.25);

      // make interactive (head follow)
      model.interactive = true;
      model.buttonMode = true;

      model.on("pointermove", (e) => {
        const { x, y } = e.data.global;
        model.internalModel.coreModel.setParameterValueById(
          "ParamAngleX",
          (x - window.innerWidth / 2) / 50
        );
        model.internalModel.coreModel.setParameterValueById(
          "ParamAngleY",
          (y - window.innerHeight / 2) / 50
        );
      });
    });

    return () => app.destroy(true);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

export default Live2DAvatar;