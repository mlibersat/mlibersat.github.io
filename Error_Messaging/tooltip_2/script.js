function ggbOnInit(name, ggbObject) {
  loadUtils().then(function (setupGGB) {
    const buttonClicks = defineButtonClickScripts();
    const {
      getCanvas,
      setAriaLabel,
      readKeyboardInstructions,
      updateKeyboardInstructions,
      ggbReadText,
      enableButton,
      libClientFunction,
      libClickFunction,
      libKeyFunction,
      registerSafeObjectUpdateListener,
      registerSafeObjectClickListener,
      registerHoverListener,
      unavailableButtonText,
      setTabOrder,
      manageAddedList,
      editXML,
      isPoly,
      selectedObject,
    } = setupGGB({
      name,
      ggbObject,
      defineKeyboardInstructions,
      buttonClicks,
      statusName: "AAppletStatus",
      preventCustomFocusIndicators: false,
    });
    const ggbcanvas = getCanvas();

    /*
     * IGNORE above
     * EDIT below
     */

    setAriaLabel(ggbcanvas, "Interactive");

    // listeners here; keep these, add your own as needed
    ggbObject.registerClientListener(function (clientEvent) {
      clientFunction(clientEvent);
      libClientFunction(clientEvent);
    });
    ggbObject.registerClickListener(function (clickedName) {
      clickListenerFunction(clickedName);
      libClickFunction(clickedName);
    });
    ggbcanvas.addEventListener("keyup", function (keyEvent) {
      keyit(keyEvent);
      libKeyFunction(keyEvent);
    });

    function defineButtonClickScripts() {
      // defines button scripts
      // keep this function, but you can delete anything/everything inside it
      return {
        ggbButton1() {
          enableButton(1, false);
          enableButton(2, true);
        },
        ggbButton2() {
          enableButton(1, true);
          enableButton(2, false);
        },
        ggbButton3() {},
        ggbButton4() {},
        ggbButton5() {},
      };
    }

    function defineKeyboardInstructions(obj) {
      // takes a GGB object name as an argument, returns its keyboard text.
      const keyboardInstructions = {
        // A: "Press the arrow keys to move this point.",
        ggbButton1: ggbObject.getValue("ggbButton1Enabled") ? "Press space to ___." : unavailableButtonText,
        ggbButton2: ggbObject.getValue("ggbButton2Enabled") ? "Press space to ___." : unavailableButtonText,
        ggbButton3: ggbObject.getValue("ggbButton3Enabled") ? "Press space to ___." : unavailableButtonText,
        ggbButton4: ggbObject.getValue("ggbButton4Enabled") ? "Press space to ___." : unavailableButtonText,
        ggbButton5: ggbObject.getValue("ggbButton5Enabled") ? "Press space to ___." : unavailableButtonText,
      };
      return keyboardInstructions[obj];
    }

    const fakeErrorMessage =
      '<span style="color: red;">&#9888; Input Error. Enter a number between 100 and 200.</span>';
    function clientFunction(clientEvent) {
      const { type, target } = clientEvent;
      if (type === "select") {
        if (target.includes("InputBox")) {
          displayFakeErrorMessage(target);
          // displayFakeErrorMessage(target);
        }
      } else if (type === "deselect") {
        // deleteOldErrorMessages();
        hideText();
      }
    }

    function displayFakeErrorMessage(boxName) {
      const { x, y } = getInputBoxCoords(boxName);
      showText(fakeErrorMessage, x, y);

      function getInputBoxCoords(boxName) {
        // Get the screen (pixel) coordinates of the GeoGebra object
        const x = getScreenX(boxName);
        const y = getScreenY(boxName);

        if (x === undefined || y === undefined) {
          console.error("Failed to get screen coordinates for:", boxName);
          return { x: 0, y: 0 };
        }

        console.log("x: %o, y: %o", x, y);
        return { x, y };

        function getScreenX(boxName) {
          const minX = ggbObject.getValue("x(Corner(1))");
          const maxX = ggbObject.getValue("x(Corner(3))");
          const windowPixelX = container.offsetWidth;
          // const windowPixelX = ggbObject.getValue("x(Corner(5))");
          const diffX = maxX - minX;
          const inputBoxBLCornerX = ggbObject.getValue(`x(Corner(${boxName},1))`);
          const screenX = ((inputBoxBLCornerX - minX) / diffX) * windowPixelX;
          return screenX;
        }

        function getScreenY(boxName) {
          const minY = ggbObject.getValue("y(Corner(1))");
          const maxY = ggbObject.getValue("y(Corner(3))");
          const windowPixelY = container.offsetHeight;
          // const windowPixelY = ggbObject.getValue("y(Corner(5))");
          const diffY = maxY - minY;
          const yNudge = 20;
          const inputBoxBLCornerY = ggbObject.getValue(`y(Corner(${boxName},1))`);
          const screenY = ((maxY - inputBoxBLCornerY) / diffY) * windowPixelY + yNudge;
          return screenY;
        }
      }
    }

    // Create a tooltip div dynamically
    const tooltip = document.createElement("div");
    const container = document.getElementById("ggb-element");
    container.appendChild(tooltip);

    // Apply styles to make it look like a speech bubble
    tooltip.style.position = "absolute";
    tooltip.style.backgroundColor = "rgb(255, 255, 255)";
    tooltip.style.border = "1px solid black";
    tooltip.style.padding = "10px";
    tooltip.style.fontSize = "18px";
    tooltip.style.borderRadius = "10px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.visibility = "hidden";
    tooltip.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
    document.body.onresize = () => {
      if (tooltip.style.visibility === "visible") {
        displayFakeErrorMessage(selectedObject.name);
      } else {
        hideText();
      }
    };

    // Add CSS for the triangle using a pseudo-element via a <style> tag in JavaScript
    const style = document.createElement("style");
    style.innerHTML = `
  .tooltip::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: var(--triangle-offset, 20px); /* Adjust dynamically */
    margin-left: -10px;
    border-width: 10px;
    border-style: solid;
    border-color: transparent transparent black transparent;
  }
`;
    document.head.appendChild(style);

    // Add the tooltip class to the tooltip element
    tooltip.classList.add("tooltip");
    // Function to show text at specified coordinates and keep it within bounds
    function showText(text, x, y) {
      tooltip.innerHTML = text;
      tooltip.style.visibility = "visible";

      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      let posX = x;
      let posY = y;
      const containerRect = container.getBoundingClientRect();
      const { right, bottom, left, top } = containerRect;
      if (x + tooltipWidth > right) {
        posX = right - tooltipWidth;
      }
      if (y + tooltipHeight > bottom) {
        posY = bottom - tooltipHeight;
      }
      if (x < left) {
        posX = left;
      }
      if (y < top) {
        posY = top;
      }
      console.table([
        ["x", x],
        ["y", y],
        ["posX", posX],
        ["posY", posY],
        ["left", left],
        ["right", right],
        ["top", top],
        ["bottom", bottom],
      ]);

      tooltip.style.left = `${posX}px`;
      tooltip.style.top = `${posY}px`;

      // Calculate triangle offset relative to the tooltip's left edge
      const triangleOffset = x - posX + left + 10;
      tooltip.style.setProperty("--triangle-offset", `${triangleOffset}px`);
    }

    // Function to hide the tooltip
    function hideText() {
      tooltip.style.visibility = "hidden";
    }

    // ///////////////////////

    function clickListenerFunction(clickedName) {
      // clickedName is a string
    }

    function keyit(keyEvent) {
      // feel free to delete key or code depending on your preferences
      // const { key, code } = keyEvent;
    }
  });

  /*
   * IGNORE BELOW
   */
  function loadUtils() {
    function parseJS(JSString) {
      return Function("" + JSString)();
    }
    if (!window.didUtils || !window.didUtils.setupGGB) {
      return fetch("https://cdn.digital.greatminds.org/did-utils/latest/index.js", {
        cache: "no-cache",
      })
        .then(function (response) {
          return response.text();
        })
        .then(function (codingText) {
          parseJS(codingText);
        })
        .then(function () {
          return window.didUtils.setupGGB;
        });
    }
    return Promise.resolve(window.didUtils.setupGGB);
  }
}
