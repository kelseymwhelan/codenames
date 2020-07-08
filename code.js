var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__);
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    const InterBold = { family: "Inter", style: "Semi Bold" };
    const InterRegular = { family: "Inter", style: "Regular" };
    yield figma.loadFontAsync(InterBold);
    yield figma.loadFontAsync(InterRegular);
    if (msg.type === 'create-game') {
        // Checks for and deletes nodes from previous games
        const existingSpymasterPage = figma.root.findOne(n => n.name === "Spymasters Only");
        const existingGameBoard = figma.currentPage.findOne(n => n.name === "Game Board");
        const existingReadMe = figma.root.findOne(n => n.name === "Read Me");
        if (existingGameBoard !== null) {
            existingGameBoard.remove();
        }
        if (existingReadMe !== null) {
            existingReadMe.remove();
        }
        if (existingSpymasterPage !== null && figma.currentPage.name !== "Spymasters Only") {
            existingSpymasterPage.remove();
        }
        // Renames current page
        figma.currentPage.name = 'Main Page';
        // Sets up colors and font styles
        const blue = { r: .286, g: .454, b: .839 };
        const red = { r: .929, g: .42, b: .38 };
        const tan = { r: .713, g: .678, b: .627 };
        const grayFill = { r: .952, g: .96, b: .972 };
        const grayBorder = { r: .917, g: .929, b: .945 };
        const darkGrayBorder = { r: .827, g: .831, b: .858 };
        const darkGrayText = { r: .12, g: .12, b: .12 };
        const cardBorderRadius = 10;
        const cardStrokeWeight = 3;
        // Randomly assign a starting team
        const startingTeam = Math.random() < 0.5 ? 'Blue' : 'Red';
        // Create an array with the correct number of cards per color
        // (an extremely hacky way to do this)
        const keyCards = [];
        const numRedCards = startingTeam == 'Red' ? 9 : 8;
        const numBlueCards = startingTeam == 'Blue' ? 9 : 8;
        const cardColors = ['Black'];
        for (let i = 0; i < numRedCards; i++) {
            cardColors.push('Red');
        }
        for (let i = 0; i < numBlueCards; i++) {
            cardColors.push('Blue');
        }
        for (let i = 0; i < 7; i++) {
            cardColors.push('Tan');
        }
        // Randomly order the array of colors
        const sortedCardColors = cardColors.sort(randomlyOrder);
        // Create game board for codenames cards
        const boardWidth = 1020;
        const boardHeight = 620;
        const board = figma.createFrame();
        board.resizeWithoutConstraints(boardWidth, boardHeight);
        board.name = 'Game Board';
        board.cornerRadius = cardBorderRadius;
        board.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        board.strokes = [{ type: 'SOLID', color: darkGrayBorder }];
        board.strokeWeight = cardStrokeWeight;
        board.x = figma.viewport.center.x - boardWidth / 2;
        board.y = figma.viewport.center.y - boardHeight / 2;
        // We need 25 words with our cards as the bottom layer
        // In this loop, we're creating a rectangle as the card background
        // then creating a text layer and inserting one of our selected codename words
        // then grouping the rectangle and text layer together as a "Card"
        // and pushing it into an array which we can then group into the "Words" layer, which we lock
        const wordCards = [];
        for (let i = 0; i < 25; i++) {
            const row = Math.floor(i / 5);
            const col = i - (5 * (row));
            const left = col * 200 + 20;
            const top = row * 120 + 20;
            const wordCard = figma.createRectangle();
            board.appendChild(wordCard);
            wordCard.x = left;
            wordCard.y = top;
            wordCard.resize(180, 100);
            wordCard.cornerRadius = cardBorderRadius;
            wordCard.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            wordCard.strokeWeight = cardStrokeWeight;
            if (sortedCardColors[i] == 'Red') {
                wordCard.fills = [{ type: 'SOLID', color: red }];
            }
            else if (sortedCardColors[i] == 'Blue') {
                wordCard.fills = [{ type: 'SOLID', color: blue }];
            }
            else if (sortedCardColors[i] == 'Black') {
                wordCard.fills = [{ type: 'SOLID', color: darkGrayText }];
            }
            else if (sortedCardColors[i] == 'Tan') {
                wordCard.fills = [{ type: 'SOLID', color: tan }];
            }
            const text = figma.createText();
            board.appendChild(text);
            text.fontName = InterBold;
            text.x = left;
            text.y = top;
            text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            text.characters = msg.words[i];
            text.fontSize = 20;
            text.textAlignHorizontal = 'CENTER';
            text.textAlignVertical = 'CENTER';
            text.resize(180, 100);
            const card = figma.group([text, wordCard], board);
            card.name = 'Card';
            wordCards.push(card);
        }
        const cardGrid = figma.group(wordCards, board);
        cardGrid.name = 'Words';
        cardGrid.locked = true;
        // Create 25 removable card coverings and layer them on top of the spymaster view
        // They will be ungrouped and unlocked to make it easy to delete them and reveal the card color
        for (let i = 0; i < 25; i++) {
            const row = Math.floor(i / 5);
            const col = i - (5 * (row));
            const left = col * 200 + 20;
            const top = row * 120 + 20;
            const cardCovering = figma.createRectangle();
            board.appendChild(cardCovering);
            cardCovering.x = left;
            cardCovering.y = top;
            cardCovering.cornerRadius = cardBorderRadius;
            cardCovering.fills = [{ type: 'SOLID', color: grayFill, opacity: 1 }];
            cardCovering.strokes = [{ type: 'SOLID', color: grayBorder }];
            cardCovering.strokeWeight = cardStrokeWeight;
            cardCovering.resize(180, 100);
            cardCovering.name = 'Card Background';
            const cardCoveringText = figma.createText();
            board.appendChild(cardCoveringText);
            cardCoveringText.fontName = InterBold;
            cardCoveringText.x = left;
            cardCoveringText.y = top;
            cardCoveringText.fills = [{ type: 'SOLID', color: darkGrayText }];
            cardCoveringText.characters = msg.words[i];
            cardCoveringText.fontSize = 20;
            cardCoveringText.textAlignHorizontal = 'CENTER';
            cardCoveringText.textAlignVertical = 'CENTER';
            cardCoveringText.resize(180, 100);
            const cardCoverGroup = figma.group([cardCoveringText, cardCovering], board);
            cardCoverGroup.name = 'Delete to reveal color';
        }
        // Create the Spymaster Page
        // Create a new Page and clone everything we just created in the Main Page
        const spymasterPage = figma.createPage();
        spymasterPage.name = 'Spymasters Only';
        const boardClone = board.clone();
        //const boardInstance = board.createInstance()
        spymasterPage.appendChild(boardClone);
        // Delete the card and border coverings to reveal the colors
        const cardsToDelete = spymasterPage.findAll(n => n.name === "Delete to reveal color");
        const groupToDelete = figma.group(cardsToDelete, spymasterPage);
        groupToDelete.remove();
        // Make the border thicker and change its color to indicate the starting team
        boardClone.strokeWeight = 5;
        if (startingTeam == 'Blue') {
            boardClone.strokes = [{ type: 'SOLID', color: blue }];
        }
        else {
            boardClone.strokes = [{ type: 'SOLID', color: red }];
        }
        // Create Read Me frame
        const readMe = figma.createFrame();
        readMe.resizeWithoutConstraints(380, 260);
        readMe.name = 'Read Me';
        readMe.cornerRadius = cardBorderRadius;
        readMe.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        readMe.strokes = [{ type: 'SOLID', color: darkGrayBorder }];
        readMe.strokeWeight = cardStrokeWeight;
        readMe.x = board.x + boardWidth + 40;
        readMe.y = board.y;
        readMe.locked = true;
        const readMeTitle = figma.createText();
        readMe.appendChild(readMeTitle);
        readMeTitle.fontName = InterBold;
        readMeTitle.x = 22;
        readMeTitle.y = 22;
        readMeTitle.resize(336, 40);
        readMeTitle.fills = [{ type: 'SOLID', color: darkGrayText }];
        readMeTitle.characters = 'Instructions';
        readMeTitle.fontSize = 24;
        readMeTitle.textAlignHorizontal = 'LEFT';
        readMeTitle.textAlignVertical = 'CENTER';
        const readMeBody = figma.createText();
        readMe.appendChild(readMeBody);
        readMeBody.fontName = InterRegular;
        readMeBody.x = 22;
        readMeBody.y = 74;
        readMeBody.resize(336, 65);
        readMeBody.fills = [{ type: 'SOLID', color: darkGrayText }];
        readMeBody.characters = 'Spymasters: view the secret identities on the “Spymasters Only” page. The color of the border is the starting team.';
        readMeBody.fontSize = 16;
        readMeBody.textAlignHorizontal = 'LEFT';
        readMeBody.textAlignVertical = 'TOP';
        const readMeBodyP2 = figma.createText();
        readMe.appendChild(readMeBodyP2);
        readMeBodyP2.fontName = InterRegular;
        readMeBodyP2.x = 22;
        readMeBodyP2.y = 155;
        readMeBodyP2.resize(336, 90);
        readMeBodyP2.fills = [{ type: 'SOLID', color: darkGrayText }];
        readMeBodyP2.characters = 'Everyone else: stay on this page for the duration of the game. To reveal the color of a card, click the word and press delete to remove its covering.';
        readMeBodyP2.fontSize = 16;
        readMeBodyP2.textAlignHorizontal = 'LEFT';
        readMeBodyP2.textAlignVertical = 'TOP';
    }
    figma.closePlugin();
    function randomlyOrder() {
        return 0.5 - Math.random();
    }
});
