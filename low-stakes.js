class LowStakesActor extends Actor {

}

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

    get title() {
        return game.i18n.localize(super.title);
    }

    get template() {
        return `systems/low-stakes/templates/${this.actor.data.type}.html`
    }

    async _onDropItemCreate(itemData) {
        if(itemData.type != "playbook") return super._onDropItemCreate();
        this.actor.items.clear();
        this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    getData() {
        const data = super.getData();
        if(this.actor.itemTypes.playbook.length > 0) {
            data.playbook = this.actor.itemTypes.playbook[0]
        }
        return data;
    }

    activateListeners(html) {
        html.find('.clout-toggle').click(() => {
            this.actor.update({'data.clout': !this.actor.data.data.clout});
        });

        html.find('.types .type').click((ev) => {
            const q = $(ev.target);
            const target = q.data('index') != undefined ? q : q.parent('[data-index]');
            this.actor.update({'data.type': parseInt(q.data('index'))});
        });
        return super.activateListeners(html);
    }
}

class LowStakesItem extends Item {

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
}

Hooks.on("init", function() {
    game.lowstakes = {
        LowStakesActor,
        LowStakesItem,
    }

    Compendium = class extends Compendium {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                template: "systems/low-stakes/templates/compendium.html"
            });
        }
    }

    CompendiumCollection = class extends CompendiumCollection {
        constructor(...args) {
            super(...args);
            this.metadata.label = game.i18n.localize(this.metadata.label)
        }      
    }

    CONFIG.Actor.documentClass = LowStakesActor;
    CONFIG.Item.documentClass = LowStakesItem;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("low-stakes", LowStakesActorSheet, {makeDefault: true});
    
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("low-stakes", LowStakesItemSheet, {makeDefault: true});

    Handlebars.registerHelper('isdefined', function(value) {
        return value != undefined;
    });

    return loadTemplates([
        "systems/low-stakes/templates/compendium.html",
        "systems/low-stakes/templates/character.html",
        "systems/low-stakes/templates/playbook.html",
        "systems/low-stakes/templates/story_outline.html",
    ])
});

Hooks.on('ready', function() {
    ui.items.constructor.documentPartial = "systems/low-stakes/templates/document-partial.html";
});