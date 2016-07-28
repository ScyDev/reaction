/* ================================================================================= */
/* Collect all tags' IDs into Session var */

Meteor.subscribe("Tags", () => {
  const tags = ReactionCore.Collections.Tags.find().fetch().map(tag =>  tag._id);
  tags.push(null); // virtual "noTag" tag
  Session.set("tags", tags);
})

