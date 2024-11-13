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
          const windowPixelX = ggbObject.getValue("x(Corner(5))");
          const diffX = maxX - minX;
          const inputBoxBLCornerX = ggbObject.getValue(`x(Corner(${boxName},1))`);
          const screenX = ((inputBoxBLCornerX - minX) / diffX) * windowPixelX;
          return screenX;
        }
        function getScreenY(boxName) {
          const minY = ggbObject.getValue("y(Corner(1))");
          const maxY = ggbObject.getValue("y(Corner(3))");
          const windowPixelY = ggbObject.getValue("y(Corner(5))");
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
    document.body.appendChild(tooltip);

    // Apply styles to make it look like a speech bubble
    tooltip.style.position = "absolute";
    tooltip.style.backgroundColor = "rgb(255, 255, 255)";
    tooltip.style.border = "1px solid black";
    tooltip.style.padding = "10px";
    tooltip.style.fontSize = "18px";
    tooltip.style.borderRadius = "10px"; // Rounded corners for speech bubble look
    tooltip.style.pointerEvents = "none"; // Allow interactions with canvas behind the tooltip
    tooltip.style.visibility = "hidden"; // Hide initially
    tooltip.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)"; // Slight shadow

    // Add CSS for the triangle using a pseudo-element
    const style = document.createElement("style");
    style.innerHTML = `
  .tooltip::after {
    content: "";
    position: absolute;
    bottom: 100%; /* Position the triangle at the top of the tooltip */
    left: 20px; /* Adjust this value to center the triangle */
    margin-left: -10px; /* Center the triangle */
    border-width: 10px;
    border-style: solid;
    border-color: transparent transparent black transparent; /* White fill */
  }
`;
    document.head.appendChild(style);

    // Add the tooltip class to the tooltip element
    tooltip.classList.add("tooltip");

    // Function to show text at specified coordinates
    function showText(text, x, y) {
      const container = document.getElementById("ggb-element");
      const containerRect = container.getBoundingClientRect();
      const { top } = containerRect;
      tooltip.innerHTML = text; // Set the text
      tooltip.style.left = `${x}px`; // Set x position
      tooltip.style.top = `${top + y}px`; // Set y position
      tooltip.style.visibility = "visible"; // Make tooltip visible
    }

    // Function to hide the tooltip
    function hideText() {
      tooltip.style.visibility = "hidden"; // Hide tooltip

      // Render LaTeX using MathJax
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, tooltip]);
    }

    /////////////////////////

    function clickListenerFunction(clickedName) {
      // clickedName is a string
    }

    function keyit(keyEvent) {
      // feel free to delete key or code depending on your preferences
      // const { key, code } = keyEvent;
    }

    /////////////////////
    //   "ggbError" +
    //     boxName +
    //     "= Text( " +
    //     fakeErrorMessage +
    //     ", (" +
    //     displayXCoord +
    //     "," +
    //     displayYCoord +
    //     "),false, true )"
    // );

    // function displayFakeErrorMessage(boxName) {
    //   const corner1X = getCornerCoord("x", 1);
    //   const corner1Y = getCornerCoord("y", 1);
    //   const corner2X = getCornerCoord("x", 2);
    //   const corner2Y = getCornerCoord("y", 2);
    //   const corner3X = getCornerCoord("x", 3);
    //   const corner3Y = getCornerCoord("y", 3);
    //   const corner4X = getCornerCoord("x", 4);
    //   const corner4Y = getCornerCoord("y", 4);

    //   console.log(
    //     "\n ",
    //     corner1X,
    //     corner1Y,
    //     "\n ",
    //     corner2X,
    //     corner2Y,
    //     "\n ",
    //     corner3X,
    //     corner3Y,
    //     "\n ",
    //     corner4X,
    //     corner4Y
    //   );
    //   const displayXCoord = corner1X;
    //   const displayYCoord = corner1Y;

    //   console.log(
    //     "evalCommand:",
    //     "ggbError" +
    //       boxName +
    //       "= Text( " +
    //       fakeErrorMessage +
    //       ", (" +
    //       displayXCoord +
    //       "," +
    //       displayYCoord +
    //       "),false, true )"
    //   );
    //   ggbObject.evalCommand(
    //     "ggbError" +
    //       boxName +
    //       "= Text( " +
    //       fakeErrorMessage +
    //       ", (" +
    //       displayXCoord +
    //       "," +
    //       displayYCoord +
    //       "),false, true )"
    //   );

    //   function getCornerCoord(xOrY, num) {
    //     return (
    //       Math.round(
    //         ggbObject.getValue(
    //           xOrY + "(Corner(" + boxName + ", " + num + "))"
    //         ) * 10
    //       ) / 10
    //     );
    //   }
    // }

    // function deleteOldErrorMessages() {
    //   const textArray = ggbObject.getAllObjectNames("text");
    //   const errorArray = textArray.filter(function (name) {
    //     return name.startsWith("ggbError");
    //   });
    //   console.log("errorArray to delete:", errorArray);
    //   console.log("textArray to delete:", textArray);
    //   errorArray.forEach(function (text) {
    //     ggbObject.deleteObject(text);
    //   });
    // }

    // add new stuff above this line
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
