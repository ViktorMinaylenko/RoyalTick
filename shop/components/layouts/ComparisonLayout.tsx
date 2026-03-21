const ComparisonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main>
            <section>
                <div className="container">
                    {children}
                </div>
            </section>
        </main>
    );
};

export default ComparisonLayout
