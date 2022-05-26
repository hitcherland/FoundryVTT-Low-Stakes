class LowStakesActorSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["low-stakes", "sheet", "actor"],
            dragDrop: [{
                dragSelector: ".playbook",
                dropSelector: null,
            }]
        });
    }

    get template() {
        return `systems/low-stakes/templates/${this.actor.data.type}.html`
    }

    async _onDropItemCreate(itemData) {
        if (itemData.type != "playbook") return super._onDropItemCreate();
        this.actor.items.clear();
        this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    getData() {
        const data = super.getData();
        if (this.actor.itemTypes.playbook.length > 0) {
            data.playbook = this.actor.itemTypes.playbook[0]
        }
        return data;
    }

    activateListeners(html) {
        html.find('.clout-toggle').click(async () => {
            if (!this.actor.data.data.clout) {
                game.actors.updateAll({
                    'data.clout': false
                }, (doc) => {
                    return doc != this.actor;
                });
            }
            this.actor.update({
                'data.clout': !this.actor.data.data.clout
            });
        });

        html.find('.types .type').click((ev) => {
            const q = $(ev.target);
            const target = q.data('index') != undefined ? q : q.parent('[data-index]');
            this.actor.update({
                'data.type': parseInt(target.data('index'))
            });
        });
        return super.activateListeners(html);
    }
}

class LowStakesItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["low-stakes", "sheet", "item"]
        });
    }

    get title() {
        return game.i18n.localize(super.title);
    }

    get template() {
        return `systems/low-stakes/templates/${this.item.data.type}.html`
    }

    activateListeners(html) {
        if (this.item.type === "story_outline") {
            html.find('.roll-setup').click(async () => {
                const table = new RollTable({
                    name: `${game.i18n.localize(this.item.name)} ${game.i18n.localize("low-stakes.setup")}`,
                    formula: "1d6",
                });

                Object.values(this.item.data.data.setups).forEach((setup, index) =>
                    table.results.set(randomID(), new TableResult({
                        type: CONST.TABLE_RESULT_TYPES.TEXT,
                        text: game.i18n.localize(setup),
                        range: [index + 1, index + 1]
                    })));

                const output = await table.roll();
                return table.toMessage(output.results);
            });

            html.find('.roll-twist').click(async () => {

                const table = new RollTable({
                    name: `${game.i18n.localize(this.item.name)} ${game.i18n.localize("low-stakes.twist")}`,
                    formula: "1d6",
                });

                Object.values(this.item.data.data.twists).forEach((twist, index) =>
                    table.results.set(randomID(), new TableResult({
                        type: CONST.TABLE_RESULT_TYPES.TEXT,
                        text: game.i18n.localize(twist),
                        range: [index + 1, index + 1]
                    })));
                    
                const output = await table.roll();
                return table.toMessage(output.results);
            });

            html.find('.roll-scenes').click(async () => {

                const table = new RollTable({
                    name: `${game.i18n.localize(this.item.name)} ${game.i18n.localize("low-stakes.scenes")}`,
                    formula: "2d6",
                });

                Object.values(this.item.data.data.scenes).forEach((scene, index) =>
                    table.results.set(randomID(), new TableResult({
                        type: CONST.TABLE_RESULT_TYPES.TEXT,
                        text: game.i18n.localize(scene),
                        range: [index + 2, index + 2]
                    })));
                    
                const output = await table.roll();
                return table.toMessage(output.results);});
        }

        return super.activateListeners(html);
    }
}

Hooks.on("init", function () {

    // Localize Document names in Compendia
    Compendium = class extends Compendium {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                template: "systems/low-stakes/templates/compendium.html"
            });
        }
    }

    // Localize Compendia labels in the Compendium Tab
    CompendiumCollection = class extends CompendiumCollection {
        constructor(...args) {
            super(...args);
            this.metadata.label = game.i18n.localize(this.metadata.label)
        }
    }

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("low-stakes", LowStakesActorSheet, {
        makeDefault: true
    });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("low-stakes", LowStakesItemSheet, {
        makeDefault: true
    });

    Handlebars.registerHelper('isdefined', function (value) {
        return value != undefined;
    });

    return loadTemplates([
        "systems/low-stakes/templates/document-partial.html",
        "systems/low-stakes/templates/compendium.html",
        "systems/low-stakes/templates/character.html",
        "systems/low-stakes/templates/playbook.html",
        "systems/low-stakes/templates/story_outline.html",
    ])
});

Hooks.on('ready', function () {
    // Localize Item names in the Item Directory
    // this is useful for drag-n-dropped items from compendia
    ui.items.constructor.documentPartial = "systems/low-stakes/templates/document-partial.html";
});