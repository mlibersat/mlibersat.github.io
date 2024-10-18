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
        ggbButton1: ggbObject.getValue("ggbButton1Enabled")
          ? "Press space to ___."
          : unavailableButtonText,
        ggbButton2: ggbObject.getValue("ggbButton2Enabled")
          ? "Press space to ___."
          : unavailableButtonText,
        ggbButton3: ggbObject.getValue("ggbButton3Enabled")
          ? "Press space to ___."
          : unavailableButtonText,
        ggbButton4: ggbObject.getValue("ggbButton4Enabled")
          ? "Press space to ___."
          : unavailableButtonText,
        ggbButton5: ggbObject.getValue("ggbButton5Enabled")
          ? "Press space to ___."
          : unavailableButtonText,
      };
      return keyboardInstructions[obj];
    }

    const fakeErrorMessage =
      '"\\bgcolor{white}{\\textcolor{red}\\textit{" + (FormulaText(UnicodeToLetter(9888))) + " Input Error. Enter a number\\\\between 100 and 200.}}"';
    function clientFunction(clientEvent) {
      const { type, target } = clientEvent;
      if (type === "select") {
        if (target.includes("InputBox")) {
          displayFakeErrorMessage(target);
        }
      } else if (type === "deselect") {
        deleteOldErrorMessages();
        // hideText();
      }
    }

    function displayFakeErrorMessage(boxName) {
      const { x, y } = getInputBoxCoords(boxName);

      showText(fakeErrorMessage, x, y);
    }
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

    function displayFakeErrorMessage(boxName) {
      const corner1X = getCornerCoord("x", 1);
      const corner1Y = getCornerCoord("y", 1);
      // TODO: Use other corners if the textbox doesn't fit
      // const corner2X = getCornerCoord("x", 2);
      // const corner2Y = getCornerCoord("y", 2);
      // const corner3X = getCornerCoord("x", 3);
      // const corner3Y = getCornerCoord("y", 3);
      // const corner4X = getCornerCoord("x", 4);
      // const corner4Y = getCornerCoord("y", 4);
      const displayXCoord = corner1X;
      const displayYCoord = corner1Y;

      ggbObject.evalCommand(
        "ggbError" +
          boxName +
          "= Text( " +
          fakeErrorMessage +
          ", (" +
          displayXCoord +
          "," +
          displayYCoord +
          "),false, true )"
      );

      function getCornerCoord(xOrY, num) {
        return (
          Math.round(
            ggbObject.getValue(
              xOrY + "(Corner(" + boxName + ", " + num + "))"
            ) * 10
          ) / 10
        );
      }
    }

    function deleteOldErrorMessages() {
      const textArray = ggbObject.getAllObjectNames("text");
      const errorArray = textArray.filter(function (name) {
        return name.startsWith("ggbError");
      });
      errorArray.forEach(function (text) {
        ggbObject.deleteObject(text);
      });
    }

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
      return fetch(
        "https://cdn.digital.greatminds.org/did-utils/latest/index.js",
        {
          cache: "no-cache",
        }
      )
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
