# terrain displacement analysis - Autodesk Forma extension
This code contains code for an extension to Autodesk Forma.
It allows users to inspect differences between different versions of the terrain, allowing them to access insights about terrain mass displacement (when editing the terrain).

This is a work in progress.
Overview of the TODO :
- [x] Basic UI to input different URN for both terrains to compare together
- [x] Compute raycasting to get the elevation difference
- [x] Visualize the result on the terrain
- [x] Add graphs to visualise the displacement results
- [ ] Fix units in graph (not nb of sampled points but either m2 or m3)
- [ ] Add inspect functionalities
- [ ] Improve UI to input both terrains to compare (waiting on proposal dropdown from Forma's API)
- [ ] Add a way to export the results
- [ ] Add an alternative raycasting method not using the GPU for more accurate results

Sources :
- Forked from : https://github.com/spacemakerai/forma-extensions-samples (more precisely from the `terrain-slope` analysis
- SDK documentation : https://aps.autodesk.com/en/docs/forma/v1/embedded-views/sdk-documentation/
