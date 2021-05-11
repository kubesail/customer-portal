import { Component } from "react";
import ProgressCircle from "./ProgressCircle";
import { fetch } from "./util";

class Settings extends Component {
  state = {
    platform: null,
    formFields: {},
    progress: 101,
  };

  updateSettings = async (e) => {
    e.preventDefault();
    this.setState({ progress: 1 });
    const formData = new FormData(e.target);
    console.log("this.props.platform", this.props.platform);
    const variableMetadata = this.props.platform.plans[0].variableMetadata;
    for (const pair of formData.entries()) {
      const variable = pair[0];
      const value = pair[1];
      const varData = variableMetadata[variable];
      if (varData.userRequired && !value) {
        this.setState({ requiredEntryError: variable });
        return;
      }
    }
    await fetch("/platform/customer/plan", {
      method: "POST",
      body: { variableData: Object.fromEntries(formData) },
    });
    this.setState({ progress: 30 });
    const updateProgress = setInterval(() => {
      const add = Math.random() * (20 - 5) + 5;
      this.setState({ progress: this.state.progress + add });
      if (this.state.progress > 100) {
        clearInterval(updateProgress);
      }
    }, Math.random() * (700 - 100) + 100);
    setTimeout(() => {
      this.props.fetchProfile();
    }, 250);
  };

  render() {
    const variableMetadata = this.props.platform.plans[0].variableMetadata;
    const variableData = this.props.profile?.customer?.platformPlans?.[0]
      ?.platformCustomerPlan?.variableData;

    return (
      <div className="Settings">
        <form onSubmit={this.updateSettings}>
          <div>
            {(this.props.profile?.customer?.platformPlans || []).map((plan) => (
              <div key={plan.name}>
                <h2>Settings</h2>
              </div>
            ))}
          </div>
          {this.state.progress > 100 ? (
            Object.keys(variableMetadata).map((variable) => {
              const field = variableMetadata[variable];
              const value = variableData?.[variable];
              return (
                <div className="input" key={variable}>
                  {variable}
                  <input
                    type="text"
                    id={variable}
                    name={variable}
                    placeholder={field.description || ""}
                    value={
                      this.state.formFields[variable] ||
                      value ||
                      field.default ||
                      ""
                    }
                    onChange={(e) =>
                      this.setState({
                        formFields: {
                          ...this.state.formFields,
                          [variable]: e.target.value,
                        },
                      })
                    }
                  />
                  {this.state.requiredEntryError === variable ? (
                    <div>This field is required!</div>
                  ) : null}
                  <label htmlFor="password" className="input-label">
                    {variable}
                  </label>
                </div>
              );
            })
          ) : (
            <div className="updating">
              Updating Settings...
              <ProgressCircle percent={this.state.progress} />
            </div>
          )}

          <button className="plain" type="submit">
            Save & Re-Launch
          </button>
        </form>
      </div>
    );
  }
}

export default Settings;
