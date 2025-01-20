import PropTypes from "prop-types";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center p-12">
      <div className="max-w-md text-center">
        <div className="mockup-browser border-base-300 border">
          <div className="mockup-browser-toolbar">
            <div className="input border-base-300 border">
              <a
                href="https://github.com/ltlylfun/sayHello"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover"
              >
                https://github.com/ltlylfun/sayHello
              </a>
            </div>
          </div>
          <div className="carousel carousel-vertical rounded-box h-96">
            <div className="carousel-item h-full">
              <img src="https://skillicons.dev/icons?i=mongodb" />
            </div>
            <div className="carousel-item h-full">
              <img src="https://skillicons.dev/icons?i=express" />
            </div>
            <div className="carousel-item h-full">
              <img src="https://skillicons.dev/icons?i=react" />
            </div>
            <div className="carousel-item h-full">
              <img src="https://skillicons.dev/icons?i=nodejs" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

AuthImagePattern.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default AuthImagePattern;
