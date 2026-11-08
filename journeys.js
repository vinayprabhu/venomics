export const ANIMALS = ['jararaca', 'gila', 'cone', 'bee'];
export const JOURNEYS = {
 jararaca: {title:'Blood pressure', chapters:['Meet the pit viper','Find the venom gland','Follow the venom','Meet teprotide','Enter the body','Discover captopril']},
 gila: {title:'Blood glucose', chapters:['Meet the Gila monster','Find the jaw glands','Follow the venom','Meet exendin-4','Enter the body','Discover exenatide']},
 cone: {title:'Pain signalling', chapters:['Meet the cone snail','Find the venom duct','Follow the venom','Meet ω-MVIIA','Enter the body','Discover ziconotide']},
 bee: {title:'Sting allergy', chapters:['Meet the honeybee','Find the venom sac','Follow the venom','Meet Api m 1','Enter the body','Discover immunotherapy']}
};
export function nextAnimal(id) {
 const index = ANIMALS.indexOf(id);
 return index < 0 ? null : ANIMALS[index + 1] ?? null;
}
