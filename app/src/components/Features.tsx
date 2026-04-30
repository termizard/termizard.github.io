import { useFeatures } from "../i18n/lang";

export default function Features() {
    const features = useFeatures();
    return (
        <section className="features">
            {features.map((f) => (
                <div className="card" key={f.title}>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                </div>
            ))}
        </section>
    );
}
