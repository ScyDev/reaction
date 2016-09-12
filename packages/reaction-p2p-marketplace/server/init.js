/**
 * Hook to setup core additional imports during ReactionCore init (shops process first)
 */
if (ReactionCore && ReactionCore.Hooks) {
  ReactionCore.Hooks.Events.add("onCoreInit", () => {
    // creates one shop as it is required to create the admin user then
    ReactionImport.fixture().process(Assets.getText("private/data/shop.json"), ["name"], ReactionImport.shop);
    ReactionImport.flush();
    // these will flush/import with the rest of the imports from core init.
  });
}
