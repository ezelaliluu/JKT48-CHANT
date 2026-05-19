function getJkt48Setlists() {
    return {
        "ramune": {
            name: "Cara Meminum Ramune (Ramune no Nomi Kata)",
            playlist: [
                typeof songPertanda !== 'undefined' ? songPertanda : { title: "Error: Pertanda Belum Dimuat", lyrics: [] },
                typeof songSchoolyardsPuppy !== 'undefined' ? songSchoolyardsPuppy : { title: "Error: Schoolyards Puppy Belum Dimuat", lyrics: [] },
                typeof songDiscoDiUks !== 'undefined' ? songDiscoDiUks : { title: "Error: Disco Di Uks Belum Dimuat", lyrics: [] },
                typeof songCaraMeminumRamune !== 'undefined' ? songCaraMeminumRamune : { title: "Error: Cara Meminum Ramune Belum Dimuat", lyrics: [] },
                
            ]
        },
        "seishun": {
            name: "Pajama Drive (Pajama Doraibu)",
            playlist: [
                typeof songPrinsipKesucianHati !== 'undefined' ? songPrinsipKesucianHati : { title: "Error: Prinsip Kesucian Hati Belum Dimuat", lyrics: [] },
                typeof songTwoYearsLater !== 'undefined' ? songTwoYearsLater : { title: "Error: Two Years Later Belum Dimuat", lyrics: [] }
            ]
        }
    };
}

const jkt48Setlists = getJkt48Setlists();

Object.keys(jkt48Setlists).forEach(key => {
    jkt48Setlists[key].playlist.forEach((song, index) => {
        song.id = index;
    });
});